import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ImageIcon, Search, Upload, Copy, Check, Loader2,
  Trash2, RefreshCw, AlertCircle, ChevronRight, CloudUpload,
  Video, Film, Play, ZoomIn
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cloudinaryApi, fileToBase64, formatBytes, type CloudinaryAsset } from '../services/cloudinaryApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, getCloudinaryVideoThumbnail } from '@/lib/utils';
import { CloudinaryUploadModal } from '../pages/cloudinary/CloudinaryUploadModal';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
}

export function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<CloudinaryAsset | null>(null);
  const [resourceTypeTab, setResourceTypeTab] = useState<'image' | 'video'>('image');

  const { data: configs = [] } = useQuery({
    queryKey: ['cloudinary-configs'],
    queryFn: cloudinaryApi.getConfigs,
    enabled: isOpen,
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => cloudinaryApi.activateConfig(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cloudinary-configs'] });
      qc.invalidateQueries({ queryKey: ['cloudinary-assets'] });
      toast({ title: '✅ Akun diganti' });
    }
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cloudinary-assets', resourceTypeTab],
    queryFn: () => cloudinaryApi.listAssets({ resource_type: resourceTypeTab }),
    enabled: isOpen,
    staleTime: 30_000,
  });

  const assets: CloudinaryAsset[] = data?.resources || [];
  const filtered = assets.filter(a =>
    !search || a.public_id.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: (public_id: string) => cloudinaryApi.deleteAsset(public_id, resourceTypeTab),
    onSuccess: () => {
      toast({ title: '🗑️ Dihapus', description: 'Asset berhasil dihapus dari Cloudinary.' });
      qc.invalidateQueries({ queryKey: ['cloudinary-assets'] });
      setConfirmDelete(null);
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Gagal hapus', description: err?.response?.data?.error || err.message });
    }
  });

  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: '✅ Link disalin!', description: url.substring(0, 60) + '...' });
  };

  const handleSelect = (url: string) => {
    onSelect?.(url);
    toast({ title: '✅ Gambar dipilih!' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Media Cloudinary</h2>
                  <p className="text-xs text-muted-foreground">{filtered.length} aset tersedia</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setShowUpload(true)} className="gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Upload Baru
                </Button>
                <Button variant="ghost" size="icon" onClick={() => refetch()} className="rounded-full" title="Refresh">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search & Account Selector */}
            <div className="px-4 py-3 border-b border-border/50 shrink-0 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {configs.map((cfg: any) => (
                    <button
                      key={cfg.id}
                      onClick={() => activateMutation.mutate(cfg.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                        cfg.is_active
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/50"
                      )}
                    >
                      <CloudUpload className={cn("w-3 h-3", cfg.is_active ? "text-primary-foreground" : "text-muted-foreground")} />
                      {cfg.label || cfg.cloud_name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                  <Button
                    type="button"
                    variant={resourceTypeTab === 'image' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs gap-1.5 font-medium"
                    onClick={() => setResourceTypeTab('image')}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Gambar
                  </Button>
                  <Button
                    type="button"
                    variant={resourceTypeTab === 'video' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs gap-1.5 font-medium"
                    onClick={() => setResourceTypeTab('video')}
                  >
                    <Video className="w-3.5 h-3.5 text-purple-400" /> Video
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan nama file..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Memuat media dari Cloudinary...</p>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="font-medium text-sm">Gagal memuat media</p>
                    <p className="text-xs text-muted-foreground mt-1">Pastikan konfigurasi Cloudinary sudah diatur di halaman Media</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>Coba Lagi</Button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                  <CloudUpload className="w-10 h-10 text-muted-foreground/50" />
                  <div>
                    <p className="font-medium text-sm">{search ? 'Tidak ada hasil' : 'Belum ada media'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {search ? 'Coba kata kunci lain' : 'Upload file pertama kamu ke Cloudinary'}
                    </p>
                  </div>
                  {!search && <Button size="sm" onClick={() => setShowUpload(true)}>Upload Sekarang</Button>}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filtered.map((asset) => (
                    <motion.div
                      key={asset.public_id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative rounded-xl overflow-hidden border border-border/40 bg-muted/30 cursor-pointer hover:border-primary/60 transition-all"
                    >
                      <div className="aspect-square overflow-hidden cursor-zoom-in relative" onClick={() => setPreviewImage(asset)}>
                        {asset.resource_type === 'video' ? (
                          <div className="w-full h-full bg-black flex items-center justify-center relative">
                            <img 
                              src={getCloudinaryVideoThumbnail(asset.secure_url)} 
                              alt={asset.public_id} 
                              className="w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                              loading="lazy" 
                            />
                            <div className="absolute top-1.5 right-1.5 bg-purple-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md z-10">
                              <Video className="w-2.5 h-2.5" /> VIDEO
                            </div>
                            <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white pointer-events-none z-10">
                              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={asset.secure_url}
                            alt={asset.public_id}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        )}
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                        {onSelect && (
                          <Button size="sm" className="w-full h-7 text-xs" onClick={() => handleSelect(asset.secure_url)}>
                            Pilih
                          </Button>
                        )}
                        <Button
                          size="sm" variant="secondary" className="w-full h-7 text-xs gap-1"
                          onClick={() => handleCopy(asset.secure_url, asset.public_id)}
                        >
                          {copiedId === asset.public_id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          Salin URL
                        </Button>
                        {confirmDelete === asset.public_id ? (
                          <div className="flex gap-1 w-full">
                            <Button size="sm" variant="destructive" className="flex-1 h-7 text-xs"
                              onClick={() => deleteMutation.mutate(asset.public_id)}
                              disabled={deleteMutation.isPending}>
                              {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ya'}
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => setConfirmDelete(null)}>
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1 hover:bg-destructive hover:text-white hover:border-destructive"
                            onClick={() => setConfirmDelete(asset.public_id)}>
                            <Trash2 className="w-3 h-3" /> Hapus
                          </Button>
                        )}
                      </div>

                      {/* Info bar */}
                      <div className="p-1.5 border-t border-border/40">
                        <p className="text-xs text-muted-foreground truncate" title={asset.public_id}>
                          {asset.public_id.split('/').pop()}
                        </p>
                        <p className="text-xs text-muted-foreground/60">{formatBytes(asset.bytes)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Upload sub-modal */}
      <CloudinaryUploadModal
        isOpen={showUpload}
        onClose={() => { setShowUpload(false); qc.invalidateQueries({ queryKey: ['cloudinary-assets'] }); }}
        onInsert={onSelect}
      />

      {/* Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-card/80 backdrop-blur-2xl border border-border/50 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Internal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-foreground truncate text-sm">
                    {previewImage.public_id.split('/').pop()}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {onSelect && (
                    <Button size="sm" className="h-8 gap-1.5" onClick={() => handleSelect(previewImage.secure_url)}>
                      <Check className="w-3.5 h-3.5" />
                      {previewImage.resource_type === 'video' ? 'Pilih Video' : 'Pilih Gambar'}
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => setPreviewImage(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Media Area */}
              <div className="flex-1 overflow-hidden flex items-center justify-center p-4 bg-black/40">
                {previewImage.resource_type === 'video' ? (
                  <CustomVideoPlayer 
                    src={previewImage.secure_url}
                    className="w-full max-w-2xl aspect-video rounded-xl"
                  />
                ) : (
                  <img src={previewImage.secure_url} alt="Preview" className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg" />
                )}
              </div>

              {/* Footer Info */}
              <div className="p-4 border-t border-border/50 bg-muted/20 text-center">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span>{previewImage.width}x{previewImage.height}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>{formatBytes(previewImage.bytes)}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
