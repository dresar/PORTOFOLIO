import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, ImageIcon, Copy, Check, Loader2,
  CloudUpload, FileImage, Trash2, Video
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cloudinaryApi, fileToBase64, formatBytes, type UploadResult } from '../../services/cloudinaryApi';
import { Button } from '@/components/ui/button';
import { cn, getCloudinaryVideoThumbnail } from '@/lib/utils';

interface CloudinaryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert?: (url: string) => void;
}

interface UploadedItem extends UploadResult {
  copied?: boolean;
}

export function CloudinaryUploadModal({ isOpen, onClose, onInsert }: CloudinaryUploadModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [provider, setProvider] = useState<'github' | 'cloudinary'>('github');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedItem[]>([]);
  const [queue, setQueue] = useState<{ file: File; status: 'pending' | 'uploading' | 'success' | 'error'; progress: number; result?: UploadResult; error?: string }[]>([]);
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
      if (!isImage && !isVideo) {
        toast({ variant: 'destructive', title: 'Gagal!', description: `${file.name} format tidak didukung.` });
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'Gagal!', description: `${file.name} melebihi 100MB.` });
        return false;
      }
      return true;
    });

    if (queue.length + newFiles.length > 30) {
      toast({ variant: 'destructive', title: 'Gagal!', description: 'Maksimal 30 file.' });
      const remaining = 30 - queue.length;
      if (remaining <= 0) return;
      newFiles.splice(remaining);
    }

    setQueue(prev => [...prev, ...newFiles.map(f => ({ file: f, status: 'pending' as const, progress: 0 }))]);
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
        const base64 = await fileToBase64(queue[i].file);
        setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, progress: 40 } : item));
        
        const result = await cloudinaryApi.uploadFile(base64, { folder: 'portfolio', provider });
        
        setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'success', progress: 100, result } : item));
        setUploaded(prev => [{ ...result }, ...prev]);
        successCount++;

        if (i < queue.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.error || err.message || 'Gagal upload';
        setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'error', error: errorMsg } : item));
        failCount++;
      }
    }

    setUploading(false);
    setCurrentIndex(-1);
    
    if (failCount === 0) {
      toast({ title: '✓ Terunggah!', description: `${successCount} file terunggah.` });
    } else {
      toast({ 
        variant: 'destructive', 
        title: 'Upload Selesai', 
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
    toast({ title: '✓ Disalin!' });
  };

  const handleInsert = (url: string) => {
    onInsert?.(url);
    toast({ title: '✓ Dipilih!' });
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
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border/50 rounded-2xl shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <CloudUpload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-base">Upload Media</h2>
                <p className="text-xs text-muted-foreground">Pilih file gambar atau video untuk diunggah.</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl border border-border/50">
              <button
                type="button"
                onClick={() => setProvider('github')}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                  provider === 'github'
                    ? "bg-background text-foreground shadow-sm border border-border font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                GitHub CDN
              </button>
              <button
                type="button"
                onClick={() => setProvider('cloudinary')}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                  provider === 'cloudinary'
                    ? "bg-background text-foreground shadow-sm border border-border font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Cloudinary
              </button>
            </div>
            {queue.length === 0 ? (
              <div
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200',
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
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { if (e.target.files) handleFilePick(e.target.files); }}
                />
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center transition-colors', isDragging ? 'bg-primary/20' : 'bg-muted')}>
                    <FileImage className={cn('w-8 h-8 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Drag & drop file di sini</p>
                    <p className="text-xs text-muted-foreground mt-1">atau klik untuk memilih file.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-[40vh] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {queue.map((item, idx) => (
                    <div key={idx} className={cn(
                      "flex items-center gap-3 p-2 rounded-lg border transition-colors",
                      currentIndex === idx ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border/40"
                    )}>
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                        {item.status === 'success' && item.result && item.result.resource_type === 'video' ? (
                          <div className="w-full h-full relative bg-black flex items-center justify-center">
                            <img src={getCloudinaryVideoThumbnail(item.result.secure_url)} className="w-full h-full object-cover" alt="video thumbnail" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <Video className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ) : item.file.type.startsWith('video/') ? (
                          <div className="w-full h-full bg-purple-950/80 flex items-center justify-center text-purple-400">
                            <Video className="w-5 h-5" />
                          </div>
                        ) : item.status === 'success' && item.result ? (
                          <img src={item.result.secure_url} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-medium truncate">{item.file.name}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{formatBytes(item.file.size)}</span>
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
                          <p className="text-[10px] text-destructive truncate mt-0.5">{item.error}</p>
                        )}
                        
                        {item.status === 'success' && (
                          <p className="text-[10px] text-green-500 mt-0.5 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Terunggah
                          </p>
                        )}
                      </div>
                      
                      <div className="shrink-0">
                        {item.status === 'pending' && !uploading && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive" onClick={() => removeItem(idx)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {item.status === 'uploading' && (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        )}
                        {item.status === 'error' && !uploading && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-destructive" onClick={() => removeItem(idx)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {!uploading && (
                    <Button variant="outline" className="flex-1" onClick={() => resetState()}>
                      Reset
                    </Button>
                  )}
                  <Button onClick={handleUpload} disabled={uploading || queue.every(i => i.status === 'success')} className="flex-[2] gap-2">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Mengunggah...' : 'Upload'}
                  </Button>
                </div>
              </div>
            )}

            {uploaded.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hasil Upload</p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {uploaded.map((item, idx) => (
                    <motion.div
                      key={item.public_id + idx}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/40 group"
                    >
                      {item.resource_type === 'video' || item.format === 'mp4' || item.format === 'webm' || item.format === 'mov' ? (
                        <div className="w-12 h-12 rounded-lg shrink-0 border border-border/50 overflow-hidden relative bg-black flex items-center justify-center">
                          <img src={getCloudinaryVideoThumbnail(item.secure_url)} alt={item.public_id} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Video className="w-5 h-5 text-white drop-shadow-md" />
                          </div>
                        </div>
                      ) : (
                        <img src={item.secure_url} alt={item.public_id} className="w-12 h-12 object-cover rounded-lg shrink-0 border border-border/50" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.public_id.split('/').pop()}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.resource_type === 'video' ? 'Video' : `${item.width || ''}×${item.height || ''}`} · {formatBytes(item.bytes)} · {(item.format || 'file').toUpperCase()}
                        </p>
                        <p className="text-xs text-primary/80 truncate mt-0.5">{item.secure_url}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7"
                          onClick={() => handleCopy(item.secure_url, idx)}
                          title="Salin"
                        >
                          {item.copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                        {onInsert && (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs px-2"
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
