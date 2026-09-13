import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useModalStore } from '@/store/modalStore';
import {
  Upload,
  FileText,
  ImageIcon,
  Trash2,
  Loader2,
  Check,
  Eye,
  FolderOpen,
  Copy,
  ExternalLink
} from 'lucide-react';
import { cloudinaryApi, fileToBase64, formatBytes } from '../services/cloudinaryApi';
import { MediaPickerModal } from './MediaPickerModal';
import { cn } from '@/lib/utils';

export type CdnProvider = 'github' | 'r2' | 'cloudinary';

interface MediaUploadInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  accept?: string;
  defaultProvider?: CdnProvider;
  folder?: string;
  description?: string;
  previewHeight?: string;
  aspectRatio?: 'square' | 'video' | 'auto';
  compact?: boolean;
}

export function MediaUploadInput({
  label = 'Media / Gambar',
  value,
  onChange,
  placeholder = 'https://... atau pilih berkas untuk diunggah',
  accept = 'image/*,.pdf',
  defaultProvider,
  folder = 'portfolio',
  description,
  aspectRatio = 'auto',
  compact = false,
}: MediaUploadInputProps) {
  const { toast } = useToast();
  const { openPdfPreviewModal } = useModalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localBlobUrl, setLocalBlobUrl] = useState<string>('');
  const [provider, setProvider] = useState<CdnProvider>(defaultProvider || 'github');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleFile = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File Terlalu Besar',
        description: `Maksimal 50MB. Berkas ini berukuran ${formatBytes(file.size)}.`,
      });
      return;
    }

    if (localBlobUrl && localBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localBlobUrl);
    }

    const isFilePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (isFilePdf) {
      setProvider('r2');
      toast({
        title: 'Dokumen PDF Terdeteksi',
        description: 'Target CDN otomatis dialihkan ke Cloudflare R2.',
      });
    } else {
      setProvider('github');
    }

    const blobUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setLocalBlobUrl(blobUrl);
    setIsUploaded(false);
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(selectedFile);
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
      const result = await cloudinaryApi.uploadFile(base64, {
        folder,
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
        description: err?.response?.data?.error || err.message || 'Terjadi kesalahan saat unggah.',
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

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: '✓ URL Disalin' });
  };

  const handleOpenPreview = () => {
    if (!activeUrl) return;
    if (isPdf) {
      openPdfPreviewModal(activeUrl, selectedFile?.name || label || 'Dokumen PDF');
    } else {
      window.open(activeUrl, '_blank');
    }
  };

  const getCdnBadgeLabel = (url: string) => {
    if (url.includes('r2.ekasyarif.my.id')) return 'Cloudflare R2';
    if (url.includes('jsdelivr.net') || url.includes('github')) return 'GitHub CDN';
    if (url.includes('cloudinary.com')) return 'Cloudinary';
    return 'URL Eksternal';
  };

  const getCdnDotColor = (url: string) => {
    if (url.includes('r2.ekasyarif.my.id')) return 'bg-orange-500';
    if (url.includes('jsdelivr.net') || url.includes('github')) return 'bg-emerald-500';
    if (url.includes('cloudinary.com')) return 'bg-sky-500';
    return 'bg-zinc-400';
  };

  return (
    <div className="rounded-lg border border-border/70 bg-card/50 p-3 space-y-2.5 shadow-xs transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            {isPdf ? <FileText className="size-3.5" /> : <ImageIcon className="size-3.5" />}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-foreground tracking-wide block truncate">{label}</span>
            {description && <p className="text-[10px] text-muted-foreground truncate">{description}</p>}
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
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="size-7 text-muted-foreground hover:text-destructive rounded-lg active:scale-[0.98]"
              title="Hapus / Reset"
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
            {provider === 'github' && '⚡ Default Gambar (jsDelivr)'}
            {provider === 'r2' && '⚡ Default PDF / Berkas'}
            {provider === 'cloudinary' && '⚡ Cloudinary Storage'}
          </span>
        </div>
        <div className="grid grid-cols-3 p-0.5 bg-muted/60 rounded-lg border border-border/60 text-center gap-0.5">
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

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleNativeChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 space-y-2">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {isPdf ? <FileText className="size-3.5" /> : <ImageIcon className="size-3.5" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatBytes(selectedFile.size)} • Target: <strong className="uppercase text-foreground">{provider}</strong>
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
              title="Batalkan File Ini"
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
                <span className="truncate">{isUploading ? 'Mengunggah...' : `Unggah ke ${provider.toUpperCase()}`}</span>
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
        isPdf ? (
          <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate max-w-[140px] sm:max-w-xs">{activeUrl.split('/').pop() || 'Dokumen PDF'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={cn('size-1.5 rounded-full shrink-0', getCdnDotColor(activeUrl))} />
                  <span className="text-[10px] text-muted-foreground">{getCdnBadgeLabel(activeUrl)}</span>
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
          <div className="relative rounded-lg border border-border/80 overflow-hidden bg-muted/40 group">
            <div
              className={cn(
                'w-full bg-black/5 dark:bg-black/30 flex items-center justify-center overflow-hidden',
                aspectRatio === 'video' ? 'aspect-video' : aspectRatio === 'square' ? 'aspect-square max-h-48' : 'h-32'
              )}
            >
              <img
                src={activeUrl}
                alt="Preview"
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/10 shadow-xs">
              <span className={cn('size-1.5 rounded-full shrink-0', getCdnDotColor(activeUrl))} />
              <span className="truncate max-w-[110px]">{getCdnBadgeLabel(activeUrl)}</span>
            </div>

            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/70 backdrop-blur-xs p-0.5 rounded-md border border-white/10 shadow-xs">
              <button
                type="button"
                onClick={handleOpenPreview}
                className="size-6 rounded text-white/90 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="Pratinjau Gambar"
              >
                <ExternalLink className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="size-6 rounded text-white/90 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="Ganti Berkas Gambar"
              >
                <Upload className="size-3" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="size-6 rounded text-red-300 hover:text-red-200 hover:bg-red-500/30 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="Hapus / Reset"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
        )
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'rounded-lg border border-dashed transition-all p-3 text-center cursor-pointer flex flex-col items-center justify-center gap-1',
            isDragging
              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
              : 'border-border/80 hover:border-primary/50 bg-muted/15 hover:bg-muted/30',
            compact ? 'py-2.5' : 'py-3.5'
          )}
        >
          <div className="size-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
            <Upload className="size-3.5" />
          </div>
          <p className="text-xs font-medium text-foreground">
            Pilih berkas atau <span className="text-primary underline underline-offset-2">telusuri</span>
          </p>
          <p className="text-[10px] text-muted-foreground">
            PNG, JPG, WebP, SVG, PDF (Maks. 50MB)
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

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setIsMediaPickerOpen(false);
          toast({ title: '✓ Media Dipilih dari Library' });
        }}
      />
    </div>
  );
}
