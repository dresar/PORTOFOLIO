import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ImageIcon,
  Search,
  Upload,
  Copy,
  Check,
  Loader2,
  Trash2,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  Video,
  Play,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useModalStore } from '@/store/modalStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi, formatBytes, type MediaAsset } from '../services/mediaApi';
import { isNewUpload, formatMediaName, sortAssetsNewestFirst } from '@/lib/mediaUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, isVideoUrl } from '@/lib/utils';
import { MediaUploadModal } from '../pages/media/MediaUploadModal';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';
import { VideoThumbnail } from '@/components/ui/VideoThumbnail';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
}

export function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
  const { toast } = useToast();
  const { openPdfPreviewModal } = useModalStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [resourceTypeTab, setResourceTypeTab] = useState<'all' | 'image' | 'video' | 'raw'>('image');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['media-assets-picker', resourceTypeTab],
    queryFn: () =>
      mediaApi.listAssets({
        resource_type: resourceTypeTab === 'all' ? undefined : resourceTypeTab,
      }),
    enabled: isOpen,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const rawAssets: MediaAsset[] = data?.resources || [];
  const assets: MediaAsset[] = useMemo(() => sortAssetsNewestFirst(rawAssets), [rawAssets]);
  const filtered = assets.filter(
    (a) => !search || a.public_id.toLowerCase().includes(search.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: (asset: MediaAsset) =>
      mediaApi.deleteAsset(asset.public_id, asset.resource_type, 'github', asset.sha),
    onSuccess: () => {
      toast({ title: '✓ Berkas dihapus' });
      qc.invalidateQueries({ queryKey: ['media-assets-picker'] });
      qc.invalidateQueries({ queryKey: ['media-assets'] });
      setConfirmDelete(null);
    },
    onError: (err: any) => {
      toast({
        variant: 'destructive',
        title: 'Gagal menghapus',
        description: err?.response?.data?.error || err.message,
      });
    },
  });

  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: '✓ URL disalin' });
  };

  const handleSelect = (url: string) => {
    onSelect?.(url);
    toast({ title: '✓ Media dipilih' });
    onClose();
  };

  const handleOpenAssetPreview = (asset: MediaAsset) => {
    const isPdf = asset.format === 'pdf' || asset.resource_type === 'raw' || /\.pdf($|\?)/i.test(asset.secure_url || asset.url);
    if (isPdf) {
      openPdfPreviewModal(asset.secure_url || asset.url, asset.public_id.split('/').pop() || 'Dokumen PDF');
    } else {
      setPreviewAsset(asset);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                  <ImageIcon className="size-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm text-foreground">Media Library</h2>
                  <p className="text-[11px] text-muted-foreground">{filtered.length} berkas ditemukan</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUpload(true);
                  }}
                  className="gap-1.5 h-8 text-xs rounded-lg active:scale-[0.98]"
                >
                  <Upload className="size-3.5" /> Upload Media
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    refetch();
                  }}
                  className="rounded-lg size-8"
                  title="Muat ulang data"
                >
                  <RefreshCw className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="rounded-lg hover:bg-destructive/10 hover:text-destructive size-8"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <div className="px-4 py-2.5 border-b border-border/50 shrink-0 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
                  <Button
                    type="button"
                    variant={resourceTypeTab === 'image' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs gap-1.5 font-medium rounded-md px-2.5"
                    onClick={() => setResourceTypeTab('image')}
                  >
                    <ImageIcon className="size-3.5" /> Gambar
                  </Button>
                  <Button
                    type="button"
                    variant={resourceTypeTab === 'raw' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs gap-1.5 font-medium rounded-md px-2.5"
                    onClick={() => setResourceTypeTab('raw')}
                  >
                    <FileText className="size-3.5 text-red-500" /> Dokumen / PDF
                  </Button>
                  <Button
                    type="button"
                    variant={resourceTypeTab === 'video' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs gap-1.5 font-medium rounded-md px-2.5"
                    onClick={() => setResourceTypeTab('video')}
                  >
                    <Video className="size-3.5 text-purple-400" /> Video
                  </Button>
                  <Button
                    type="button"
                    variant={resourceTypeTab === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 text-xs font-medium rounded-md px-2.5"
                    onClick={() => setResourceTypeTab('all')}
                  >
                    Semua
                  </Button>
                </div>

                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari berkas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-8 text-xs rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Memuat media...</p>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-center">
                  <AlertCircle className="size-6 text-destructive" />
                  <div>
                    <p className="font-medium text-xs">Gagal memuat media</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Periksa koneksi server penyimpanan</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => refetch()} className="rounded-lg h-7 text-xs">
                    Coba Lagi
                  </Button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-center border border-dashed rounded-xl p-4">
                  <FolderOpen className="size-8 text-muted-foreground/40" />
                  <div>
                    <p className="font-medium text-xs">{search ? 'Tidak ada hasil pencarian' : 'Belum ada media tersimpan'}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {search ? 'Coba kata kunci lain' : 'Unggah berkas pertama Anda'}
                    </p>
                  </div>
                  {!search && (
                    <Button type="button" size="sm" onClick={() => setShowUpload(true)} className="rounded-lg h-7 text-xs gap-1.5">
                      <Upload className="size-3" /> Upload
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filtered.map((asset) => {
                    const isPdf = asset.format === 'pdf' || asset.resource_type === 'raw' || /\.pdf($|\?)/i.test(asset.secure_url || asset.url);
                    const isVideo = asset.resource_type === 'video' || isVideoUrl(asset.secure_url || asset.url) || ['mp4', 'webm', 'mov'].includes(asset.format || '');

                    return (
                      <motion.div
                        key={asset.public_id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative rounded-xl overflow-hidden border border-border/50 bg-card hover:border-primary/60 transition-all"
                      >
                        <div
                          className="aspect-square overflow-hidden cursor-pointer relative bg-muted/40"
                          onClick={() => handleOpenAssetPreview(asset)}
                        >
                          {/* NEW Badge (within 5 minutes of upload) */}
                          {isNewUpload(asset, 5) && (
                            <div className="absolute top-1.5 right-1.5 z-20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-lg border border-white/25 flex items-center gap-1 animate-pulse select-none">
                              <span className="size-1.5 rounded-full bg-white animate-ping" />
                              NEW
                            </div>
                          )}

                          {isVideo ? (
                            <div className="size-full bg-black flex items-center justify-center relative">
                              <VideoThumbnail
                                src={asset.secure_url || asset.url}
                                className="size-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                                showBadge={false}
                              />
                              {!isNewUpload(asset, 5) && (
                                <div className="absolute top-1.5 right-1.5 bg-purple-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs z-10">
                                  <Video className="size-2.5" /> VIDEO
                                </div>
                              )}
                              <div className="absolute inset-0 m-auto size-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white pointer-events-none z-10">
                                <Play className="size-3 fill-white ml-0.5" />
                              </div>
                            </div>
                          ) : isPdf ? (
                            <div className="size-full bg-red-500/10 flex flex-col items-center justify-center p-3 text-red-500">
                              <FileText className="size-8 mb-1" />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-center line-clamp-1">
                                PDF Dokumen
                              </span>
                            </div>
                          ) : (
                            <img
                              src={asset.secure_url}
                              alt={asset.public_id}
                              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          )}
                        </div>

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                          {onSelect && (
                            <Button
                              type="button"
                              size="sm"
                              className="w-full h-7 text-xs rounded-md font-semibold active:scale-[0.98]"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(asset.secure_url || asset.url);
                              }}
                            >
                              Pilih
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="w-full h-7 text-xs gap-1 rounded-md"
                            onClick={() => handleCopy(asset.secure_url || asset.url, asset.public_id)}
                          >
                            {copiedId === asset.public_id ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                            Salin
                          </Button>
                          {confirmDelete === asset.public_id ? (
                            <div className="flex gap-1 w-full">
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="flex-1 h-7 text-xs rounded-md"
                                onClick={() => deleteMutation.mutate(asset)}
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : 'Ya'}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="flex-1 h-7 text-xs rounded-md"
                                onClick={() => setConfirmDelete(null)}
                              >
                                Batal
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="w-full h-7 text-xs gap-1 rounded-md hover:bg-destructive hover:text-white hover:border-destructive"
                              onClick={() => setConfirmDelete(asset.public_id)}
                            >
                              <Trash2 className="size-3" /> Hapus
                            </Button>
                          )}
                        </div>

                        <div className="p-1.5 border-t border-border/40">
                          <p className="text-xs text-foreground truncate font-medium" title={asset.public_id}>
                            {formatMediaName(asset.public_id)}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">{formatBytes(asset.bytes || 0)}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <MediaUploadModal
        isOpen={showUpload}
        onClose={() => {
          setShowUpload(false);
          qc.invalidateQueries({ queryKey: ['media-assets-picker'] });
          qc.invalidateQueries({ queryKey: ['media-assets'] });
          refetch();
        }}
        onInsert={(url) => {
          setShowUpload(false);
          onSelect?.(url);
          onClose();
        }}
      />

      <AnimatePresence>
        {previewAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setPreviewAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-card border border-border/60 rounded-xl overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-foreground truncate text-sm">
                    {previewAsset.public_id.split('/').pop()}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 gap-1 text-primary text-xs rounded-md"
                    onClick={() => handleCopy(previewAsset.secure_url, previewAsset.public_id)}
                  >
                    {copiedId === previewAsset.public_id ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    <span>Salin</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    asChild
                    className="h-7 text-xs rounded-md"
                  >
                    <a href={previewAsset.secure_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 rounded-md hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setPreviewAsset(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex items-center justify-center p-4 bg-black/40">
                {previewAsset.resource_type === 'video' || isVideoUrl(previewAsset.secure_url || previewAsset.url) || ['mp4', 'webm', 'mov'].includes(previewAsset.format || '') ? (
                  <CustomVideoPlayer
                    src={previewAsset.secure_url || previewAsset.url}
                    className="w-full max-w-2xl aspect-video rounded-lg"
                  />
                ) : (
                  <img
                    src={previewAsset.secure_url}
                    alt={previewAsset.public_id}
                    className="max-w-full max-h-[65vh] object-contain rounded-md"
                  />
                )}
              </div>

              <div className="p-3 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <p className="font-mono text-[11px] text-primary/80 truncate max-w-md">
                  {previewAsset.secure_url}
                </p>
                <span className="font-mono text-[11px]">
                  {formatBytes(previewAsset.bytes || 0)}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
