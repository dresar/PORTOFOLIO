import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useModalStore } from '@/store/modalStore';
import { FileText, Eye, Upload, Trash2, Check, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { cloudinaryApi, fileToBase64, formatBytes } from '../services/cloudinaryApi';

interface DocumentAttachmentInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  titleValue?: string;
  onTitleChange?: (title: string) => void;
  notesValue?: string;
  onNotesChange?: (notes: string) => void;
  showTitle?: boolean;
  showNotes?: boolean;
  titleLabel?: string;
  notesLabel?: string;
  placeholder?: string;
  previewTitle?: string;
  accept?: string;
  onRemove?: () => void;
  removable?: boolean;
}

export function DocumentAttachmentInput({
  label = 'File / Dokumen PDF',
  value,
  onChange,
  titleValue,
  onTitleChange,
  notesValue,
  onNotesChange,
  showTitle = true,
  showNotes = false,
  titleLabel = 'Nama Dokumen / Keterangan',
  notesLabel = 'Catatan Tambahan',
  placeholder = 'URL file atau unggah PDF / Gambar...',
  previewTitle,
  accept = '.pdf,image/*',
  onRemove,
  removable = false,
}: DocumentAttachmentInputProps) {
  const { toast } = useToast();
  const { openPdfPreviewModal } = useModalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localBlobUrl, setLocalBlobUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  useEffect(() => {
    return () => {
      if (localBlobUrl && localBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [localBlobUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File Terlalu Besar',
        description: `Ukuran maksimal adalah 25MB. File ini ${formatBytes(file.size)}.`,
      });
      return;
    }

    if (localBlobUrl && localBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localBlobUrl);
    }

    const blobUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setLocalBlobUrl(blobUrl);
    setIsUploaded(false);

    // Auto-fill title if empty
    if (showTitle && onTitleChange && (!titleValue || titleValue.trim() === '')) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      onTitleChange(cleanName);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(selectedFile);
      const result = await cloudinaryApi.uploadFile(base64, {
        folder: 'portfolio/documents',
        public_id: selectedFile.name.replace(/\.[^/.]+$/, ''),
      });

      const uploadedUrl = result.secure_url || result.url || result.local_url;
      if (!uploadedUrl) throw new Error('Gagal mendapatkan URL hasil unggahan.');

      onChange(uploadedUrl);
      setIsUploaded(true);
      toast({
        title: '✓ Berhasil Diunggah!',
        description: `${selectedFile.name} telah tersimpan di CDN.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Mengunggah',
        description: err?.response?.data?.error || err.message || 'Terjadi kesalahan saat mengunggah file.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const activeUrl = localBlobUrl || value;
  const isPdf = activeUrl ? /\.pdf($|\?)/i.test(activeUrl) || (selectedFile && selectedFile.type === 'application/pdf') : false;

  const handleOpenPreview = () => {
    if (!activeUrl) {
      toast({
        variant: 'destructive',
        title: 'Belum Ada File',
        description: 'Pilih file atau masukkan URL dokumen terlebih dahulu.',
      });
      return;
    }
    const docTitle = titleValue || previewTitle || (selectedFile ? selectedFile.name : 'Pratinjau Dokumen');
    openPdfPreviewModal(activeUrl, docTitle);
  };

  const handleClearSelectedFile = () => {
    if (localBlobUrl && localBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localBlobUrl);
    }
    setSelectedFile(null);
    setLocalBlobUrl('');
    setIsUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="rounded-lg border border-border/70 bg-card/60 p-4 space-y-3.5 shadow-sm">
      {/* Title & Remove Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            {isPdf ? <FileText className="size-3.5" /> : <ImageIcon className="size-3.5" />}
          </div>
          <span className="text-xs font-semibold text-foreground tracking-wide uppercase">{label}</span>
          {isPdf && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">
              PDF
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {activeUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenPreview}
              className="h-7 px-2.5 text-[11px] font-medium rounded-lg gap-1 border-primary/40 text-primary hover:bg-primary/10"
              title="Pratinjau Dokumen"
            >
              <Eye className="size-3" />
              <span>Pratinjau {isPdf ? 'PDF' : 'Media'}</span>
            </Button>
          )}

          {removable && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="size-7 text-muted-foreground hover:text-destructive rounded-lg"
              title="Hapus Lampiran"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Optional Title input */}
      {showTitle && onTitleChange && (
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">{titleLabel}</Label>
          <Input
            value={titleValue || ''}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Contoh: Sertifikat Akreditasi BAN-PT Baik Sekali (2025 - 2030)"
            className="h-8 text-xs rounded-lg"
          />
        </div>
      )}

      {/* File Chooser & Direct URL */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Hidden native input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 px-3 text-xs rounded-lg gap-1.5 shrink-0 font-medium"
          >
            <Upload className="size-3.5" />
            <span>Pilih File PDF / Media</span>
          </Button>

          {/* URL Input */}
          <div className="flex-1 min-w-0">
            <Input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="h-8 text-xs font-mono rounded-lg"
            />
          </div>
        </div>

        {/* Selected Local File Status Card */}
        {selectedFile && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/60 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="size-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-muted-foreground">{formatBytes(selectedFile.size)} • Lokal (Belum Disimpan)</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenPreview}
                className="h-7 px-2 text-[11px] rounded-lg gap-1"
              >
                <Eye className="size-3" />
                <span className="hidden sm:inline">Tes Pratinjau</span>
              </Button>

              {!isUploaded ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="h-7 px-2.5 text-[11px] rounded-lg gap-1 font-semibold"
                >
                  {isUploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                  <span>{isUploading ? 'Mengunggah...' : 'Upload ke CDN'}</span>
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                  <Check className="size-3" />
                  <span>Terunggah</span>
                </span>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearSelectedFile}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                title="Batal pilih file"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Optional Notes input */}
      {showNotes && onNotesChange && (
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">{notesLabel}</Label>
          <Input
            value={notesValue || ''}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Catatan tambahan (misal: Berlaku hingga 2030 / Lisensi MIT)"
            className="h-8 text-xs rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
