import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useModalStore } from '@/store/modalStore';
import {
  FileText,
  Eye,
  Upload,
  Trash2,
  Check,
  Loader2,
  FolderOpen,
  Copy
} from 'lucide-react';
import { mediaApi, fileToBase64, formatBytes } from '../services/mediaApi';
import { MediaPickerModal } from './MediaPickerModal';

export type CdnProvider = 'github';

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
  placeholder = '/media/uploads/... atau unggah PDF',
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
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (localBlobUrl && localBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [localBlobUrl]);

  const activeUrl = localBlobUrl || value;
  const isPdf = activeUrl
    ? /\.pdf($|\?)/i.test(activeUrl) || (selectedFile && selectedFile.type === 'application/pdf')
    : selectedFile
    ? selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')
    : false;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File Terlalu Besar',
        description: `Ukuran maksimal adalah 50MB. File ini ${formatBytes(file.size)}.`,
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

    if (showTitle && onTitleChange && !titleValue) {
      const suggestedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      onTitleChange(suggestedTitle);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(selectedFile);
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
      const result = await mediaApi.uploadFile(base64, {
        folder: 'uploads',
        public_id: cleanName
      });

      const uploadedUrl = result.secure_url || result.url;
      if (!uploadedUrl) throw new Error('Gagal mendapatkan URL hasil unggahan.');

      onChange(uploadedUrl);
      setIsUploaded(true);
      toast({
        title: '✓ Dokumen Terunggah',
        description: `${selectedFile.name} berhasil disimpan di GitHub Storage.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal Unggah',
        description: err?.response?.data?.error || err.message || 'Terjadi kesalahan saat unggah dokumen.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    if (localBlobUrl && localBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localBlobUrl);
    }
    setSelectedFile(null);
    setLocalBlobUrl('');
    setIsUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange('');
  };

  const handleOpenPreview = () => {
    if (!activeUrl) return;
    openPdfPreviewModal(activeUrl, previewTitle || titleValue || selectedFile?.name || 'Dokumen');
  };

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: '✓ URL Disalin' });
  };

  return (
    <div className="rounded-lg border border-border/80 bg-card/60 p-3 space-y-3 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 shrink-0">
            <FileText className="size-3.5" />
          </div>
          <span className="text-xs font-semibold text-foreground tracking-wide truncate">{label}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMediaPickerOpen(true)}
            className="h-7 px-2 text-[11px] font-medium rounded-lg gap-1 border-border/80 hover:bg-muted active:scale-[0.98]"
            title="Pilih dari Library"
          >
            <FolderOpen className="size-3 text-muted-foreground" />
            <span className="hidden sm:inline">Library</span>
          </Button>

          {activeUrl && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="size-7 text-muted-foreground hover:text-destructive rounded-lg active:scale-[0.98]"
              title="Reset File"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}

          {removable && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="size-7 text-destructive hover:bg-destructive/10 rounded-lg active:scale-[0.98]"
              title="Hapus Lampiran Ini"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {showTitle && onTitleChange && (
        <div className="space-y-1">
          <Label className="text-[11px] font-medium text-muted-foreground">{titleLabel}</Label>
          <Input
            value={titleValue || ''}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Contoh: Ijazah Sarjana, Sertifikat Akreditasi BAN-PT"
            className="h-8 text-xs rounded-lg border-border/80"
          />
        </div>
      )}

      {selectedFile ? (
        <div className="rounded-lg border border-border/80 bg-muted/40 p-2.5 space-y-2">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <FileText className="size-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatBytes(selectedFile.size)} • Storage: <strong className="text-foreground">GitHub</strong>
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedFile(null);
                setLocalBlobUrl('');
              }}
              className="size-6 text-muted-foreground hover:text-destructive rounded-md shrink-0"
              title="Batalkan File"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            {!isUploaded ? (
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
                className="h-7 flex-1 px-2.5 text-[11px] rounded-lg gap-1.5 font-semibold active:scale-[0.98]"
              >
                {isUploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                <span className="truncate">{isUploading ? 'Mengunggah...' : 'Unggah Dokumen'}</span>
              </Button>
            ) : (
              <div className="flex-1 inline-flex items-center justify-center gap-1 h-7 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Check className="size-3" />
                <span>Sukses Tersimpan</span>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-7 px-2.5 text-[11px] rounded-lg text-muted-foreground hover:text-foreground active:scale-[0.98]"
            >
              Ganti
            </Button>
          </div>
        </div>
      ) : activeUrl ? (
        <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate max-w-[140px] sm:max-w-xs">{titleValue || activeUrl.split('/').pop() || 'Dokumen PDF'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="size-1.5 rounded-full shrink-0 bg-emerald-500" />
                <span className="text-[10px] text-muted-foreground">GitHub Storage</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenPreview}
              className="h-7 px-2 text-[11px] rounded-lg gap-1 border-primary/30 text-primary hover:bg-primary/10 active:scale-[0.98]"
              title="Buka Pratinjau PDF"
            >
              <Eye className="size-3" />
              <span className="hidden sm:inline">Pratinjau</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground active:scale-[0.98]"
              title="Ganti Berkas"
            >
              <Upload className="size-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-dashed border-border/80 hover:border-primary/50 bg-muted/15 hover:bg-muted/30 transition-all p-3 text-center cursor-pointer flex flex-col items-center justify-center gap-1 py-3"
        >
          <div className="size-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
            <Upload className="size-3.5" />
          </div>
          <p className="text-xs font-medium text-foreground">
            Pilih dokumen PDF atau <span className="text-primary underline underline-offset-2">telusuri</span>
          </p>
          <p className="text-[10px] text-muted-foreground">
            Format PDF, Dokumen (Maks. 50MB)
          </p>
        </div>
      )}

      <div className="relative flex items-center w-full">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 w-full pr-8 text-xs font-mono rounded-lg border-border/70 focus-visible:ring-1 focus-visible:ring-primary/40 truncate"
        />
        {value && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-1 text-muted-foreground hover:text-foreground size-6 flex items-center justify-center rounded-md hover:bg-muted/80 transition-all cursor-pointer active:scale-95"
            title="Salin URL"
          >
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
          </button>
        )}
      </div>

      {showNotes && onNotesChange && (
        <div className="space-y-1 pt-1">
          <Label className="text-[11px] font-medium text-muted-foreground">{notesLabel}</Label>
          <Input
            value={notesValue || ''}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Keterangan tambahan dokumen..."
            className="h-8 text-xs rounded-lg border-border/80"
          />
        </div>
      )}

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setIsMediaPickerOpen(false);
          toast({ title: '✓ Dokumen Dipilih dari Library' });
        }}
      />
    </div>
  );
}
