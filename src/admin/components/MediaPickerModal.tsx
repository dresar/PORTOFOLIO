import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ImageIcon, Search, Upload, Copy, Check, Loader2,
  Trash2, RefreshCw, AlertCircle, CloudUpload,
  Video, Play, ZoomIn, Server, Cloud
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cloudinaryApi, formatBytes, type CloudinaryAsset } from '../services/cloudinaryApi';
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
  const [providerFilter, setProviderFilter] = useState<'all' | 'github' | 'cloudinary'>('all');

  const { data: configs = [] } = useQuery({
    queryKey: ['cloudinary-configs'],
    queryFn: cloudinaryApi.getConfigs,
    enabled: isOpen,
  });

  const cloudinaryConfigs = configs.filter((c: any) => c.id !== 9999);

  const activateMutation = useMutation({
    mutationFn: (id: number) => cloudinaryApi.activateConfig(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cloudinary-configs'] });
      qc.invalidateQueries({ queryKey: ['cloudinary-assets'] });
      toast({ title: 'Akun Cloudinary diganti' });
    }
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cloudinary-assets', resourceTypeTab, providerFilter],
    queryFn: () => cloudinaryApi.listAssets({ 
      resource_type: resourceTypeTab,
      provider: providerFilter,
      max_results: 50
    }),
    enabled: isOpen,
    staleTime: 30_000,
  });

  const assets: CloudinaryAsset[] = data?.resources || [];
  const filtered = assets.filter(a =>
    !search || a.public_id.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: (asset: CloudinaryAsset) => cloudinaryApi.deleteAsset(asset.public_id, resourceTypeTab, asset.provider, asset.sha),
    onSuccess: () => {
      toast({ title: 'Aset Dihapus' });
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
    toast({ title: 'Link CDN Disalin' });
  };

  const handleSelect = (url: string) => {
    onSelect?.(url);
    toast({ title: 'Media Dipilih' });
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
            <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Media Library (GitHub CDN & Cloudinary)</h2>
                  <p className="text-xs text-muted-foreground">{filtered.length} aset siap digunakan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setShowUpload(true)} className="gap-1.5 h-8 text-xs">
                  <Upload className="w-3.5 h-3.5" /> Upload Media
                </Button>
                <Button variant="ghost" size="icon" onClick={() => refetch()} className="rounded-full h-8 w-8">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="px-4 py-3 border-b border-border/50 shrink-0 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/50">
                  <Button
                    type="button"
                    variant={providerFilter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs font-medium px-3"
                    onClick={() => setProviderFilter('all')}
                  >
                    Semua
                  </Button>
                  <Button
                    type="button"
                    variant={providerFilter === 'github' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs font-medium gap-1 px-3"
                    onClick={() => setProviderFilter('github')}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    GitHub CDN
                  </Button>
                  <Button
                    type="button"
                    variant={providerFilter === 'cloudinary' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs font-medium gap-1 px-3"
                    onClick={() => setProviderFilter('cloudinary')}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    Cloudinary
                  </Button>
                </div>

                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
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

              {providerFilter === 'cloudinary' && cloudinaryConfigs.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-xs text-muted-foreground shrink-0">Akun Cloudinary:</span>
                  {cloudinaryConfigs.map((cfg: any) => (
                    <button
                      key={cfg.id}
                      onClick={() => activateMutation.mutate(cfg.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border",
                        cfg.is_active 
                          ? "bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-400 shadow-sm" 
                          : "border-border/50 hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <Cloud className="w-3 h-3" />
                      {cfg.label || cfg.cloud_name}
                      {cfg.is_active && <Check className="w-3 h-3 text-sky-500" />}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder=""
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Memuat media aset...</p>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="font-medium text-sm">Gagal memuat media</p>
                    <p className="text-xs text-muted-foreground mt-1">Periksa koneksi CDN dan penyimpanan</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>Coba Lagi</Button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center border border-dashed rounded-2xl">
                  <CloudUpload className="w-10 h-10 text-muted-foreground/50" />
                  <div>
                    <p className="font-medium text-sm">{search ? 'Tidak ada hasil' : 'Belum ada media'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {search ? 'Coba kata kunci lain' : 'Upload file pertama kamu'}
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

                        <div className="absolute top-1.5 left-1.5 z-10">
                          {asset.provider === 'github' ? (
                            <span className="bg-emerald-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow backdrop-blur-sm">
                              <Server className="w-2 h-2" /> GitHub CDN
                            </span>
                          ) : (
                            <span className="bg-sky-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow backdrop-blur-sm">
                              <Cloud className="w-2 h-2" /> Cloudinary
                            </span>
                          )}
                        </div>
                      </div>

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
                              onClick={() => deleteMutation.mutate(asset)}
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

      <CloudinaryUploadModal
        isOpen={showUpload}
        onClose={() => { setShowUpload(false); qc.invalidateQueries({ queryKey: ['cloudinary-assets'] }); }}
        onInsert={onSelect}
      />

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-card/80 backdrop-blur-2xl border border-border/50 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-foreground truncate text-sm">
                    {previewImage.public_id.split('/').pop()}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" className="h-8 gap-1.5 text-primary text-xs" onClick={() => handleCopy(previewImage.secure_url, previewImage.public_id)}>
                    {copiedId === previewImage.public_id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Salin Link CDN</span>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => setPreviewImage(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex items-center justify-center p-4 bg-black/40">
                {previewImage.resource_type === 'video' ? (
                  <CustomVideoPlayer 
                    src={previewImage.secure_url} 
                    className="w-full max-w-2xl aspect-video rounded-xl"
                  />
                ) : (
                  <img
                    src={previewImage.secure_url}
                    alt={previewImage.public_id}
                    className="max-w-full max-h-[60vh] object-contain shadow-lg rounded-lg"
                  />
                )}
              </div>

              <div className="p-4 border-t border-border/50 bg-muted/20 text-center">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">Penyedia:</span>
                    <span className="capitalize">{previewImage.provider === 'github' ? 'GitHub CDN (jsDelivr Edge)' : `Cloudinary (${previewImage._account || ''})`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">Dimensi:</span>
                    <span>{previewImage.width} × {previewImage.height}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">Ukuran:</span>
                    <span>{formatBytes(previewImage.bytes)}</span>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-primary/70 mt-3 truncate max-w-md mx-auto opacity-60">
                  {previewImage.secure_url}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
