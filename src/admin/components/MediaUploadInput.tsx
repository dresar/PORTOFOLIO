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
  Server,
  CloudUpload,
  Cloud,
  FolderOpen,
  Copy
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
        description: 'Target CDN otomatis disetel ke Cloudflare R2.',
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
      openPdfPreviewModal(activeUrl, selectedFile?.name || 'Dokumen PDF');
    } else {
      window.open(activeUrl, '_blank');
    }
  };

  return (
    <div className="rounded-lg border border-border/70 bg-card/50 p-3.5 space-y-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            {isPdf ? <FileText className="size-3.5" /> : <ImageIcon className="size-3.5" />}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-foreground tracking-wide block truncate">{label}</span>
            {description && <p className="text-[11px] text-muted-foreground truncate">{description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMediaPickerOpen(true)}
            className="h-7 px-2 text-[11px] font-medium rounded-lg gap-1 border-border/80 hover:bg-muted"
            title="Pilih dari Media Library"
          >
            <FolderOpen className="size-3 text-muted-foreground" />
            <span>Pilih dari Library</span>
          </Button>

          {activeUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenPreview}
              className="h-7 px-2 text-[11px] font-medium rounded-lg gap-1 border-primary/40 text-primary hover:bg-primary/10"
              title="Pratinjau"
            >
              <Eye className="size-3" />
              <span>Pratinjau</span>
            </Button>
          )}

          {activeUrl && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="size-7 text-muted-foreground hover:text-destructive rounded-lg"
              title="Hapus / Reset"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/50 rounded-lg border border-border/60">
        <span className="text-[11px] font-medium text-muted-foreground px-1.5 shrink-0">Target CDN:</span>
        <button
          type="button"
          onClick={() => setProvider('github')}
          className={cn(
            'flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium transition-all cursor-pointer',
            provider === 'github'
              ? 'bg-background text-foreground shadow-xs border border-border font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <Server className="size-3 text-emerald-500" />
          <span>GitHub CDN (jsDelivr)</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold hidden sm:inline">
            Gambar
          </span>
        </button>

        <button
          type="button"
          onClick={() => setProvider('r2')}
          className={cn(
            'flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium transition-all cursor-pointer',
            provider === 'r2'
              ? 'bg-background text-foreground shadow-xs border border-border font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="size-1.5 rounded-full bg-orange-500" />
          <CloudUpload className="size-3 text-orange-500" />
          <span>Cloudflare R2</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold hidden sm:inline">
            PDF / Dokumen
          </span>
        </button>

        <button
          type="button"
          onClick={() => setProvider('cloudinary')}
          className={cn(
            'flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium transition-all cursor-pointer',
            provider === 'cloudinary'
              ? 'bg-background text-foreground shadow-xs border border-border font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="size-1.5 rounded-full bg-sky-500" />
          <Cloud className="size-3 text-sky-500" />
          <span>Cloudinary</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleNativeChange}
        className="hidden"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!selectedFile && !value) {
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          'relative rounded-lg border border-dashed transition-all p-3 text-center cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/30',
          compact ? 'py-2.5' : 'py-3.5'
        )}
      >
        {selectedFile ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-left">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {isPdf ? <FileText className="size-4" /> : <ImageIcon className="size-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatBytes(selectedFile.size)} • Siap diunggah ke{' '}
                  <strong className="text-foreground uppercase">{provider}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              {!isUploaded ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="h-7 px-3 text-[11px] rounded-lg gap-1.5 font-semibold"
                >
                  {isUploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
                  <span>{isUploading ? 'Mengunggah...' : `Unggah ke ${provider === 'r2' ? 'R2' : provider === 'github' ? 'GitHub' : 'Cloudinary'}`}</span>
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <Check className="size-3" />
                  <span>Sukses Tersimpan</span>
                </span>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 px-2 text-[11px] rounded-lg text-muted-foreground hover:text-foreground"
              >
                Ganti
              </Button>
            </div>
          </div>
        ) : activeUrl ? (
          <div className="flex items-center justify-between gap-3 text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2.5 min-w-0">
              {isPdf ? (
                <div className="size-10 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0">
                  <FileText className="size-5" />
                </div>
              ) : (
                <div
                  className={cn(
                    'rounded-md border bg-muted overflow-hidden shrink-0',
                    aspectRatio === 'video' ? 'w-16 h-10' : 'size-10'
                  )}
                >
                  <img src={activeUrl} alt="Preview" className="size-full object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-mono text-foreground truncate max-w-xs">{activeUrl.split('/').pop()}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {activeUrl.includes('r2.ekasyarif.my.id') ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400">
                      Cloudflare R2
                    </span>
                  ) : activeUrl.includes('jsdelivr.net') || activeUrl.includes('github') ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      GitHub CDN
                    </span>
                  ) : activeUrl.includes('cloudinary.com') ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400">
                      Cloudinary
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                      External URL
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 px-2 text-[11px] rounded-lg gap-1"
              >
                <Upload className="size-3" />
                <span className="hidden sm:inline">Ganti Berkas</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                title="Salin URL"
              >
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 py-1">
            <Upload className="size-5 text-muted-foreground" />
            <p className="text-xs font-medium text-foreground">
              Tarik & lepas file ke sini, atau <span className="text-primary underline font-semibold">pilih file</span>
            </p>
            <p className="text-[10px] text-muted-foreground">
              Format didukung: PNG, JPG, WebP, SVG, PDF (Maks. 50MB)
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 text-xs font-mono rounded-lg"
        />
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
