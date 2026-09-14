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
  ExternalLink,
  Video,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { mediaApi, formatBytes } from '../services/mediaApi';
import { compressImageToWebP } from '@/lib/mediaUtils';
import { MediaPickerModal } from './MediaPickerModal';
import { cn, isVideoUrl } from '@/lib/utils';
import { VideoThumbnail } from '@/components/ui/VideoThumbnail';
import { useAdminDebugStore } from '../store/adminDebugStore';

export type CdnProvider = 'github';

interface MediaUploadInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  accept?: string;
  defaultProvider?: string;
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
  placeholder = 'https://cdn.jsdelivr.net/... atau pilih berkas',
  accept = 'image/*,.pdf',
  folder = 'uploads',
  description,
  aspectRatio = 'auto',
  compact = false,
}: MediaUploadInputProps) {
  const { toast } = useToast();
  const { openPdfPreviewModal } = useModalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localBlobUrl, setLocalBlobUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    return () => {
      if (localBlobUrl && localBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [localBlobUrl]);

  const activeUrl = localBlobUrl || value;
  const isPdf = activeUrl
    ? /\.pdf($|\?)/i.test(activeUrl)
    : false;

  const isVideo = activeUrl
    ? isVideoUrl(activeUrl) || /\.(mp4|webm|mov|mkv|avi|m4v)($|\?)/i.test(activeUrl)
    : false;

  const handleUploadFile = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      const msg = `Maksimal 50MB. Berkas ini berukuran ${formatBytes(file.size)}.`;
      toast({
        variant: 'destructive',
        title: 'File Terlalu Besar',
        description: msg,
      });
      useAdminDebugStore.getState().addLog({
        level: 'warn',
        category: 'upload',
        title: `[Upload Rejected] File too large: ${file.name} (${formatBytes(file.size)})`,
        details: { fileName: file.name, size: file.size }
      });
      return;
    }

    setLastUploadedFile(file);
    setUploadError(null);

    // Show immediate blob preview while uploading
    const blobUrl = URL.createObjectURL(file);
    setLocalBlobUrl(blobUrl);
    setIsUploading(true);

    useAdminDebugStore.getState().addLog({
      level: 'info',
      category: 'upload',
      title: `[Upload Start] ${file.name} (${formatBytes(file.size)})`,
      details: { name: file.name, size: file.size, type: file.type, folder }
    });

    try {
      // Direct WebP compression for ultra-lightweight CDN assets
      const compressed = await compressImageToWebP(file, { quality: 0.88, maxDimension: 1920 });
      
      const result = await mediaApi.uploadFile(compressed.base64, {
        folder,
        public_id: compressed.fileName
      });

      const uploadedUrl = result.secure_url || result.url;
      if (!uploadedUrl) throw new Error('Gagal mendapatkan URL hasil unggahan dari server.');

      useAdminDebugStore.getState().addLog({
        level: 'success',
        category: 'upload',
        title: `[Upload Success] ${compressed.fileName} (${formatBytes(compressed.compressedSize)})`,
        details: { result, originalName: compressed.originalName, ratio: `${((1 - compressed.compressedSize / compressed.originalSize) * 100).toFixed(1)}% hemat` }
      });

      onChange(uploadedUrl);
      setLocalBlobUrl(''); // switch to official CDN url
      toast({
        title: '✓ Tersimpan di GitHub Storage!',
        description: `${compressed.fileName} berhasil diunggah & diterapkan.`,
      });
    } catch (err: any) {
      const errMessage = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Terjadi kesalahan saat unggah.';
      setUploadError(errMessage);
      
      useAdminDebugStore.getState().addLog({
        level: 'error',
        category: 'upload',
        title: `[Upload Failed] ${file.name}: ${errMessage}`,
        details: { error: err?.response?.data || err.message, stack: err?.stack }
      });

      toast({
        variant: 'destructive',
        title: 'Gagal Mengunggah Berkas',
        description: errMessage,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadFile(file);
  };

  const handleClear = () => {
    if (localBlobUrl && localBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localBlobUrl);
    }
    setLocalBlobUrl('');
    setUploadError(null);
    setLastUploadedFile(null);
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
      openPdfPreviewModal(activeUrl, label || 'Dokumen PDF');
    } else {
      window.open(activeUrl, '_blank');
    }
  };

  return (
    <div className="rounded-lg border border-border/70 bg-card/50 p-3 space-y-2.5 shadow-xs transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            {isPdf ? <FileText className="size-3.5" /> : isVideo ? <Video className="size-3.5 text-purple-400" /> : <ImageIcon className="size-3.5" />}
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
            onClick={(e) => {
              e.stopPropagation();
              setIsMediaPickerOpen(true);
            }}
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
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="size-7 text-muted-foreground hover:text-destructive rounded-lg active:scale-[0.98]"
              title="Hapus / Reset"
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
        onChange={handleNativeChange}
        className="hidden"
      />

      {/* Upload Error Alert with Retry */}
      {uploadError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 flex items-start justify-between gap-2 text-rose-300 text-xs">
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-[11px] text-rose-200">Gagal mengunggah media</p>
              <p className="text-[10px] text-rose-300/90 break-all">{uploadError}</p>
            </div>
          </div>
          {lastUploadedFile && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleUploadFile(lastUploadedFile)}
              className="h-6 text-[10px] px-2 rounded gap-1 bg-rose-950/40 border-rose-500/30 text-rose-200 hover:bg-rose-900/50 shrink-0"
            >
              <RefreshCw className="size-2.5" />
              <span>Coba Lagi</span>
            </Button>
          )}
        </div>
      )}

      {/* Media Display Area */}
      {activeUrl ? (
        isPdf ? (
          <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate max-w-[140px] sm:max-w-xs">{activeUrl.split('/').pop() || 'Dokumen PDF'}</p>
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
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'relative rounded-lg border border-border/80 overflow-hidden bg-muted/40 group transition-all',
              isDragging && 'ring-2 ring-primary border-primary'
            )}
          >
            <div
              className={cn(
                'w-full bg-black/5 dark:bg-black/30 flex items-center justify-center overflow-hidden',
                aspectRatio === 'video' || isVideo ? 'aspect-video' : aspectRatio === 'square' ? 'aspect-square max-h-48' : 'h-36'
              )}
            >
              {isVideo ? (
                <VideoThumbnail src={activeUrl} className="w-full h-full object-cover" showBadge={true} badgePosition="center" showPlayIcon={true} />
              ) : (
                <img
                  src={activeUrl}
                  alt="Preview"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            {/* Storage Badge */}
            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/75 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/10 shadow-xs z-10">
              <span className="size-1.5 rounded-full shrink-0 bg-emerald-500" />
              <span className="truncate max-w-[110px]">GitHub Storage</span>
            </div>

            {/* Uploading Progress Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-20 animate-in fade-in duration-200">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="text-xs font-semibold tracking-wide">Mengunggah ke GitHub CDN...</span>
                <span className="text-[10px] text-zinc-400 font-mono">WebP compression active</span>
              </div>
            )}

            {/* Top Action Overlay Buttons */}
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/75 backdrop-blur-xs p-0.5 rounded-md border border-white/10 shadow-xs z-10">
              <button
                type="button"
                onClick={handleOpenPreview}
                className="size-6 rounded text-white/90 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="Buka Pratinjau Gambar"
              >
                <ExternalLink className="size-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMediaPickerOpen(true);
                }}
                className="size-6 rounded text-white/90 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="Pilih dari Media Library"
              >
                <FolderOpen className="size-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="size-6 rounded text-white/90 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="Ganti Berkas / Upload Baru"
              >
                <Upload className="size-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
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
            'relative rounded-lg border border-dashed transition-all p-3 text-center cursor-pointer flex flex-col items-center justify-center gap-1 overflow-hidden',
            isDragging
              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
              : 'border-border/80 hover:border-primary/50 bg-muted/15 hover:bg-muted/30',
            compact ? 'py-2.5' : 'py-3.5'
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-1.5 py-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs font-semibold text-foreground">Mengompres & Mengunggah...</p>
              <p className="text-[10px] text-muted-foreground">Otomatis konversi ke format WebP ringan</p>
            </div>
          ) : (
            <>
              <div className="size-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                <Upload className="size-3.5" />
              </div>
              <p className="text-xs font-medium text-foreground">
                Pilih berkas atau <span className="text-primary underline underline-offset-2">telusuri</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                PNG, JPG, WebP, SVG, PDF (Maks. 50MB) • Auto simpan ke GitHub CDN
              </p>
            </>
          )}
        </div>
      )}

      {/* URL Input Bar */}
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
