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
  ImageIcon,
  FolderOpen,
  Copy
} from 'lucide-react';
import { cloudinaryApi, fileToBase64, formatBytes } from '../services/cloudinaryApi';
import { MediaPickerModal } from './MediaPickerModal';
import { cn } from '@/lib/utils';

export type CdnProvider = 'github' | 'r2' | 'cloudinary';

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
  placeholder = 'URL file atau unggah PDF / Dokumen...',
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
  const [provider, setProvider] = useState<CdnProvider>('r2');
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

    const isFilePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (isFilePdf) {
      setProvider('r2');
    } else {
      setProvider('github');
    }

    const blobUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setLocalBlobUrl(blobUrl);
    setIsUploaded(false);

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
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
      const result = await cloudinaryApi.uploadFile(base64, {
        folder: 'documents',
        public_id: cleanName,
        provider,
      });

      const uploadedUrl = result.secure_url || result.url;
      if (!uploadedUrl) throw new Error('Gagal mendapatkan URL hasil unggahan.');

      onChange(uploadedUrl);
      setIsUploaded(true);
      toast({
        title: provider === 'r2' ? '✓ Tersimpan di Cloudflare R2!' : '✓ Tersimpan di GitHub CDN!',
        description: `${selectedFile.name} berhasil diunggah (${provider.toUpperCase()}).`,
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

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: '✓ URL Disalin' });
  };

  return (
    <div className="rounded-lg border border-border/70 bg-card/50 p-3 sm:p-3.5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            {isPdf ? <FileText className="size-3.5" /> : <ImageIcon className="size-3.5" />}
          </div>
          <div className="min-w-0 flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground tracking-wide block truncate">{label}</span>
            {isPdf && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
                PDF
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMediaPickerOpen(true)}
            className="h-7 px-2 text-[11px] font-medium rounded-lg gap-1 border-border/80 hover:bg-muted active:scale-[0.98]"
            title="Pilih dari Media Library"
          >
            <FolderOpen className="size-3 text-muted-foreground" />
            <span className="hidden sm:inline">Library</span>
          </Button>

          {activeUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenPreview}
              className="h-7 px-2 text-[11px] font-medium rounded-lg gap-1 border-primary/30 text-primary hover:bg-primary/10 active:scale-[0.98]"
              title="Pratinjau Dokumen"
            >
              <Eye className="size-3" />
              <span className="hidden sm:inline">Pratinjau</span>
            </Button>
          )}

          {removable && onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="size-7 text-muted-foreground hover:text-destructive rounded-lg active:scale-[0.98]"
              title="Hapus Lampiran"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-0.5">
          <span className="font-medium">Target CDN</span>
          <span className="font-normal text-muted-foreground/80">
            {provider === 'r2' && '⚡ Default PDF (Cloudflare R2)'}
            {provider === 'github' && '⚡ Default Gambar (jsDelivr)'}
            {provider === 'cloudinary' && '⚡ Cloudinary Storage'}
          </span>
        </div>
        <div className="grid grid-cols-3 p-0.5 bg-muted/60 rounded-lg border border-border/60 text-center gap-0.5">
          <button
            type="button"
            onClick={() => setProvider('r2')}
            className={cn(
              'flex items-center justify-center gap-1.5 h-7 rounded-md text-[11px] font-medium transition-all cursor-pointer active:scale-[0.98]',
              provider === 'r2'
                ? 'bg-background text-foreground shadow-xs border border-border/80 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
            )}
            title="Cloudflare R2 Bucket"
          >
            <span className="size-1.5 rounded-full bg-orange-500 shrink-0" />
            <span className="truncate">Cloudflare R2</span>
          </button>

          <button
            type="button"
            onClick={() => setProvider('github')}
            className={cn(
              'flex items-center justify-center gap-1.5 h-7 rounded-md text-[11px] font-medium transition-all cursor-pointer active:scale-[0.98]',
              provider === 'github'
                ? 'bg-background text-foreground shadow-xs border border-border/80 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
            )}
            title="GitHub CDN (jsDelivr Edge)"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => setProvider('cloudinary')}
            className={cn(
              'flex items-center justify-center gap-1.5 h-7 rounded-md text-[11px] font-medium transition-all cursor-pointer active:scale-[0.98]',
              provider === 'cloudinary'
                ? 'bg-background text-foreground shadow-xs border border-border/80 font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
            )}
            title="Cloudinary Media Storage"
          >
            <span className="size-1.5 rounded-full bg-sky-500 shrink-0" />
            <span className="truncate">Cloudinary</span>
          </button>
        </div>
      </div>

      {showTitle && onTitleChange && (
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">{titleLabel}</Label>
          <Input
            value={titleValue || ''}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Contoh: Sertifikat Akreditasi BAN-PT Baik Sekali (2025 - 2030)"
            className="h-8 text-xs rounded-lg border-border/70 focus-visible:ring-1 focus-visible:ring-primary/40"
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 px-3 text-xs rounded-lg gap-1.5 shrink-0 font-medium active:scale-[0.98] border-border/80 hover:bg-muted"
        >
          <Upload className="size-3.5" />
          <span>Pilih Berkas PDF / Gambar</span>
        </Button>

        <div className="relative flex-1 min-w-0">
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
              className="absolute right-1 top-1 text-muted-foreground hover:text-foreground size-6 flex items-center justify-center rounded-md hover:bg-muted/80 transition-all cursor-pointer active:scale-95"
              title="Salin URL"
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            </button>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/70 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="size-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {formatBytes(selectedFile.size)} • Target: <strong className="text-foreground uppercase">{provider}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isUploaded ? (
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
                className="h-7 px-2.5 text-[11px] rounded-lg gap-1 font-semibold active:scale-[0.98]"
              >
                {isUploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                <span>{isUploading ? 'Mengunggah...' : `Upload ke ${provider.toUpperCase()}`}</span>
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                <Check className="size-3" />
                <span>Tersimpan</span>
              </span>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClearSelectedFile}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground active:scale-[0.98]"
              title="Batal pilih file"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      )}

      {showNotes && onNotesChange && (
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">{notesLabel}</Label>
          <Input
            value={notesValue || ''}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Catatan tambahan (misal: Berlaku hingga 2030 / Lisensi MIT)"
            className="h-8 text-xs rounded-lg border-border/70 focus-visible:ring-1 focus-visible:ring-primary/40"
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
