import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, ImageIcon, Copy, Check, Loader2,
  FileImage, Trash2, Video, FileText
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { mediaApi, formatBytes, type UploadResult } from '../../services/mediaApi';
import { compressImageToWebP } from '@/lib/mediaUtils';
import { Button } from '@/components/ui/button';
import { cn, isVideoUrl } from '@/lib/utils';
import { VideoThumbnail } from '@/components/ui/VideoThumbnail';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert?: (url: string) => void;
}

interface UploadedItem extends UploadResult {
  copied?: boolean;
}

export function MediaUploadModal({ isOpen, onClose, onInsert }: MediaUploadModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedItem[]>([]);
  const [queue, setQueue] = useState<{
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    result?: UploadResult;
    error?: string;
  }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const resetState = () => {
    setQueue([]);
    setCurrentIndex(-1);
    setUploading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFilePick = (files: FileList | File[]) => {
    const newFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isImage && !isVideo && !isPdf) {
        toast({
          variant: 'destructive',
          title: 'Format tidak didukung',
          description: `${file.name} bukan gambar, video, atau dokumen PDF.`
        });
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Ukuran terlalu besar',
          description: `${file.name} melebihi batas 100MB.`
        });
        return false;
      }
      return true;
    });

    if (queue.length + newFiles.length > 30) {
      toast({
        variant: 'destructive',
        title: 'Maksimal 30 file',
        description: 'Anda dapat mengunggah maksimal 30 berkas sekaligus.'
      });
      const remaining = 30 - queue.length;
      if (remaining <= 0) return;
      newFiles.splice(remaining);
    }

    setQueue(prev => [
      ...prev,
      ...newFiles.map(f => ({ file: f, status: 'pending' as const, progress: 0 }))
    ]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFilePick(e.dataTransfer.files);
  }, [queue.length]);

  const handleUpload = async () => {
    if (queue.length === 0 || uploading) return;
    setUploading(true);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === 'success') continue;

      setCurrentIndex(i);
      setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'uploading' } : item));

      try {
        // Compress raster images to ultra-crisp, lightweight WebP
        const compressed = await compressImageToWebP(queue[i].file, { quality: 0.88, maxDimension: 1920 });
        setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, progress: 40 } : item));

        const result = await mediaApi.uploadFile(compressed.base64, {
          folder: 'portfolio',
          public_id: compressed.fileName
        });

        setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'success', progress: 100, result } : item));
        setUploaded(prev => [{ ...result }, ...prev]);
        successCount++;

        if (i < queue.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.error || err.message || 'Gagal upload berkas';
        setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error', error: errorMsg } : item));
        failCount++;
      }
    }

    setUploading(false);
    setCurrentIndex(-1);

    if (failCount === 0) {
      toast({ title: '✓ Berhasil diunggah', description: `${successCount} berkas tersimpan ke penyimpanan.` });
    } else {
      toast({
        variant: 'destructive',
        title: 'Upload selesai',
        description: `${successCount} berhasil, ${failCount} gagal.`
      });
    }
  };

  const removeItem = (index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const handleCopy = async (url: string, idx: number) => {
    await navigator.clipboard.writeText(url);
    setUploaded(prev => prev.map((item, i) => i === idx ? { ...item, copied: true } : item));
    setTimeout(() => setUploaded(prev => prev.map((item, i) => i === idx ? { ...item, copied: false } : item)), 2000);
    toast({ title: '✓ URL disalin' });
  };

  const handleInsert = (url: string) => {
    onInsert?.(url);
    toast({ title: '✓ Media dipilih' });
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[110] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border/60 rounded-xl shadow-2xl"
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                <Upload className="size-4" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-foreground">Upload Media</h2>
                <p className="text-xs text-muted-foreground">Penyimpanan mandiri (Gambar, Video, atau Dokumen PDF)</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="p-5 space-y-4">
            {queue.length === 0 ? (
              <div
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : 'border-border/60 hover:border-primary/60 hover:bg-muted/30'
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,application/pdf,.pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => { if (e.target.files) handleFilePick(e.target.files); }}
                />
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <div className={cn('size-14 rounded-xl flex items-center justify-center transition-colors', isDragging ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                    <FileImage className="size-7" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Drag & drop berkas ke sini</p>
                    <p className="text-xs text-muted-foreground mt-0.5">atau klik untuk memilih gambar, video, atau dokumen PDF</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="max-h-[38vh] overflow-y-auto space-y-2 pr-1">
                  {queue.map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-center gap-3 p-2.5 rounded-lg border transition-colors',
                        currentIndex === idx ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border/40'
                      )}
                    >
                      <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                        {item.status === 'success' && item.result && (item.result.resource_type === 'video' || isVideoUrl(item.result.secure_url)) ? (
                          <div className="size-full relative bg-black flex items-center justify-center">
                            <VideoThumbnail src={item.result.secure_url} className="size-full object-cover" showBadge={true} badgePosition="center" />
                          </div>
                        ) : item.file.type.startsWith('video/') ? (
                          <div className="size-full bg-purple-950/80 flex items-center justify-center text-purple-400">
                            <Video className="size-5" />
                          </div>
                        ) : item.file.type === 'application/pdf' || item.file.name.endsWith('.pdf') ? (
                          <div className="size-full bg-red-500/10 flex items-center justify-center text-red-500">
                            <FileText className="size-5" />
                          </div>
                        ) : item.status === 'success' && item.result ? (
                          <img src={item.result.secure_url} className="size-full object-cover" alt="preview" />
                        ) : (
                          <ImageIcon className="size-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-medium truncate">{item.file.name}</p>
                          <span className="text-[11px] text-muted-foreground shrink-0 ml-2 font-mono">{formatBytes(item.file.size)}</span>
                        </div>

                        {item.status === 'uploading' && (
                          <div className="mt-1.5 space-y-1">
                            <div className="h-1 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {item.status === 'error' && (
                          <p className="text-[11px] text-destructive truncate mt-0.5">{item.error}</p>
                        )}

                        {item.status === 'success' && (
                          <p className="text-[11px] text-emerald-500 mt-0.5 flex items-center gap-1 font-medium">
                            <Check className="size-3" /> Berhasil diunggah
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {item.status === 'pending' && !uploading && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-md text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(idx)}
                          >
                            <X className="size-3.5" />
                          </Button>
                        )}
                        {item.status === 'uploading' && (
                          <Loader2 className="size-4 animate-spin text-primary" />
                        )}
                        {item.status === 'error' && !uploading && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-md text-destructive"
                            onClick={() => removeItem(idx)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  {!uploading && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs rounded-lg active:scale-[0.98]"
                      onClick={() => resetState()}
                    >
                      Reset
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={uploading || queue.every(i => i.status === 'success')}
                    className="flex-[2] h-8 text-xs gap-1.5 rounded-lg active:scale-[0.98]"
                  >
                    {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                    {uploading ? 'Mengunggah...' : 'Unggah Sekarang'}
                  </Button>
                </div>
              </div>
            )}

            {uploaded.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hasil Upload</p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {uploaded.map((item, idx) => (
                    <motion.div
                      key={item.public_id + idx}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border/40"
                    >
                      {item.resource_type === 'video' || isVideoUrl(item.secure_url) ? (
                        <div className="size-11 rounded-md shrink-0 border border-border/50 overflow-hidden relative bg-black flex items-center justify-center">
                          <VideoThumbnail src={item.secure_url} className="size-full object-cover" showBadge={true} badgePosition="center" />
                        </div>
                      ) : item.resource_type === 'raw' || item.format === 'pdf' ? (
                        <div className="size-11 rounded-md shrink-0 border border-border/50 bg-red-500/10 text-red-500 flex items-center justify-center">
                          <FileText className="size-5" />
                        </div>
                      ) : (
                        <img src={item.secure_url} alt={item.public_id} className="size-11 object-cover rounded-md shrink-0 border border-border/50" />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-foreground">{item.public_id.split('/').pop()}</p>
                        <p className="text-[11px] font-mono text-primary/80 truncate">{item.secure_url}</p>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 rounded-md"
                          onClick={() => handleCopy(item.secure_url, idx)}
                          title="Salin URL"
                        >
                          {item.copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                        </Button>
                        {onInsert && (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs px-2.5 rounded-md active:scale-[0.98]"
                            onClick={() => handleInsert(item.secure_url)}
                          >
                            Pilih
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
