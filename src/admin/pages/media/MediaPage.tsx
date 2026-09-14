import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Trash2, Loader2,
  AlertCircle, Upload,
  RefreshCw, Copy, Check, Search, ZoomIn, Play, Video,
  FileText, ImageIcon, X, ExternalLink
} from 'lucide-react';
import { mediaApi, formatBytes, type MediaAsset } from '../../services/mediaApi';
import { isNewUpload, formatMediaName, sortAssetsNewestFirst } from '@/lib/mediaUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn, isVideoUrl } from '@/lib/utils';
import { MediaUploadModal } from './MediaUploadModal';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';
import { VideoThumbnail } from '@/components/ui/VideoThumbnail';
import { useModalStore } from '@/store/modalStore';

export default function MediaPage() {
  const { toast } = useToast();
  const { openPdfPreviewModal } = useModalStore();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [resourceTypeTab, setResourceTypeTab] = useState<'all' | 'image' | 'video' | 'raw'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['media-assets', resourceTypeTab],
    queryFn: () => mediaApi.listAssets({
      resource_type: resourceTypeTab === 'all' ? undefined : resourceTypeTab
    }),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const rawAssets: MediaAsset[] = data?.resources || [];
  const assets: MediaAsset[] = useMemo(() => sortAssetsNewestFirst(rawAssets), [rawAssets]);

  const deleteMutation = useMutation({
    mutationFn: (asset: MediaAsset) => mediaApi.deleteAsset(asset.public_id, asset.resource_type, 'github', asset.sha),
    onSuccess: () => {
      toast({ title: '✓ Berkas dihapus' });
      qc.invalidateQueries({ queryKey: ['media-assets'] });
      setConfirmDel(null);
    },
    onError: (e: any) => toast({
      variant: 'destructive',
      title: 'Gagal menghapus berkas',
      description: e?.response?.data?.error || e.message
    })
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === assets.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(assets.map(a => a.public_id)));
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Hapus permanen ${selectedIds.size} berkas yang dipilih?`)) {
      const items = assets.filter(a => selectedIds.has(a.public_id));
      for (const item of items) {
        deleteMutation.mutate(item);
      }
      setSelectedIds(new Set());
    }
  };

  const filtered = assets.filter(a => {
    const matchSearch = !search || a.public_id.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (resourceTypeTab === 'all') return true;
    if (resourceTypeTab === 'image') return a.resource_type === 'image' || (!a.resource_type && !a.public_id.endsWith('.pdf'));
    if (resourceTypeTab === 'raw') return a.resource_type === 'raw' || a.format === 'pdf' || a.public_id.toLowerCase().endsWith('.pdf');
    if (resourceTypeTab === 'video') return a.resource_type === 'video' || ['mp4', 'webm', 'mov'].includes(a.format || '');
    return true;
  });

  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: '✓ URL disalin' });
  };

  const handleOpenPreview = (asset: MediaAsset) => {
    const isPdf = asset.format === 'pdf' || asset.resource_type === 'raw' || /\.pdf($|\?)/i.test(asset.secure_url || asset.url);
    if (isPdf) {
      openPdfPreviewModal(asset.secure_url || asset.url, asset.public_id.split('/').pop() || 'Dokumen PDF');
    } else {
      setPreviewAsset(asset);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <FolderOpen className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Media Library</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Penyimpanan berkas foto, dokumen PDF, dan video portofolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await qc.invalidateQueries({ queryKey: ['media-assets'] });
              refetch();
            }}
            disabled={isFetching}
            className="h-8 size-8 p-0 rounded-lg shrink-0"
            title="Muat ulang data"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          </Button>
          <Button
            size="sm"
            onClick={() => setShowUpload(true)}
            className="h-8 text-xs gap-1.5 px-3 rounded-lg active:scale-[0.98] shrink-0"
          >
            <Upload className="size-3.5" /> Unggah Media
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
          <Button
            type="button"
            variant={resourceTypeTab === 'all' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs font-medium px-2.5 rounded-md"
            onClick={() => setResourceTypeTab('all')}
          >
            Semua
          </Button>
          <Button
            type="button"
            variant={resourceTypeTab === 'image' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs gap-1.5 font-medium px-2.5 rounded-md"
            onClick={() => setResourceTypeTab('image')}
          >
            <ImageIcon className="size-3.5" /> Gambar
          </Button>
          <Button
            type="button"
            variant={resourceTypeTab === 'raw' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs gap-1.5 font-medium px-2.5 rounded-md"
            onClick={() => setResourceTypeTab('raw')}
          >
            <FileText className="size-3.5 text-red-500" /> Dokumen / PDF
          </Button>
          <Button
            type="button"
            variant={resourceTypeTab === 'video' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs gap-1.5 font-medium px-2.5 rounded-md"
            onClick={() => setResourceTypeTab('video')}
          >
            <Video className="size-3.5 text-purple-400" /> Video
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={deleteMutation.isPending}
                className="h-8 gap-1.5 px-3 text-xs rounded-lg active:scale-[0.98]"
              >
                {deleteMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                Hapus ({selectedIds.size})
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
                className="h-8 px-2 text-xs rounded-lg"
              >
                Batal
              </Button>
            </div>
          )}

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari berkas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSelectAll}
          className="h-7 text-xs gap-2 text-muted-foreground hover:text-foreground rounded-md"
        >
          <div className={cn(
            'size-3.5 rounded border flex items-center justify-center transition-colors',
            selectedIds.size === assets.length && assets.length > 0 ? 'bg-primary border-primary' : 'border-border'
          )}>
            {selectedIds.size === assets.length && assets.length > 0 && <Check className="size-2.5 text-white" />}
          </div>
          Pilih Semua
        </Button>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-mono">
          {filtered.length} Berkas
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-52 gap-3">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Memuat media penyimpanan...</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center h-52 gap-3 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <div>
            <p className="font-medium text-sm">Gagal memuat media</p>
            <p className="text-xs text-muted-foreground mt-1">Periksa koneksi server penyimpanan.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="rounded-lg h-8 text-xs">
            Coba Lagi
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 gap-3 text-center border border-dashed rounded-xl p-6">
          <FolderOpen className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-sm text-foreground">{search ? 'Tidak ada hasil pencarian' : 'Belum ada media tersimpan'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? 'Coba gunakan nama berkas lain' : 'Unggah gambar, dokumen, atau video pertama Anda'}
            </p>
          </div>
          {!search && (
            <Button size="sm" onClick={() => setShowUpload(true)} className="rounded-lg h-8 text-xs gap-1.5">
              <Upload className="size-3.5" /> Unggah Sekarang
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filtered.map(asset => {
            const isPdf = asset.format === 'pdf' || asset.resource_type === 'raw' || /\.pdf($|\?)/i.test(asset.secure_url || asset.url);
            const isVideo = asset.resource_type === 'video' || isVideoUrl(asset.secure_url || asset.url) || ['mp4', 'webm', 'mov'].includes(asset.format || '');

            return (
              <motion.div
                key={asset.public_id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  'group relative rounded-xl overflow-hidden border transition-all duration-200 bg-card',
                  selectedIds.has(asset.public_id)
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-border/50 hover:border-primary/60 hover:shadow-md'
                )}
              >
                <div
                  className="aspect-square overflow-hidden cursor-pointer relative bg-muted/40"
                  onClick={() => handleOpenPreview(asset)}
                >
                  {isVideo ? (
                    <div className="size-full bg-black flex items-center justify-center relative">
                      <VideoThumbnail
                        src={asset.secure_url || asset.url}
                        className="size-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                        showBadge={false}
                      />
                      <div className="absolute top-2 right-2 bg-purple-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs z-10">
                        <Video className="size-2.5" /> VIDEO
                      </div>
                      <div className="absolute inset-0 m-auto size-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white pointer-events-none z-10">
                        <Play className="size-3.5 fill-white ml-0.5" />
                      </div>
                    </div>
                  ) : isPdf ? (
                    <div className="size-full bg-red-500/10 flex flex-col items-center justify-center p-3 text-red-500">
                      <FileText className="size-9 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-center line-clamp-1">
                        PDF Dokumen
                      </span>
                    </div>
                  ) : (
                    <img
                      src={asset.secure_url}
                      alt={asset.public_id}
                      className={cn(
                        'size-full object-cover transition-transform duration-300',
                        selectedIds.has(asset.public_id) ? 'scale-100 opacity-60' : 'group-hover:scale-105'
                      )}
                      loading="lazy"
                    />
                  )}

                  {/* NEW Badge (within 5 minutes of upload) */}
                  {isNewUpload(asset, 5) && (
                    <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-lg border border-white/25 flex items-center gap-1 animate-pulse select-none">
                      <span className="size-1.5 rounded-full bg-white animate-ping" />
                      NEW
                    </div>
                  )}

                  <div
                    className={cn(
                      'absolute top-2 left-2 z-20 size-4 rounded-sm border flex items-center justify-center transition-all cursor-pointer',
                      selectedIds.has(asset.public_id)
                        ? 'bg-primary border-primary shadow-sm'
                        : 'bg-black/60 border-white/50 opacity-0 group-hover:opacity-100 hover:border-primary'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(asset.public_id);
                    }}
                    title="Pilih berkas"
                  >
                    {selectedIds.has(asset.public_id) && <Check className="size-2.5 text-white stroke-[3]" />}
                  </div>

                  {!selectedIds.has(asset.public_id) && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPreview(asset);
                        }}
                        className="size-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary transition-colors"
                        title="Buka Preview"
                      >
                        <ZoomIn className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(asset.secure_url, asset.public_id);
                        }}
                        className="size-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-primary transition-colors"
                        title="Salin URL"
                      >
                        {copiedId === asset.public_id ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDel(asset.public_id);
                        }}
                        className="size-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-destructive transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )}
                </div>

                {confirmDel === asset.public_id && (
                  <div className="absolute inset-0 z-30 bg-destructive/95 backdrop-blur-sm p-3 flex flex-col items-center justify-center text-center text-white gap-2">
                    <AlertCircle className="size-6" />
                    <p className="text-xs font-semibold">Hapus berkas ini?</p>
                    <div className="flex gap-1.5 w-full">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs flex-1 rounded-md"
                        onClick={() => deleteMutation.mutate(asset)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? '...' : 'Ya'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs flex-1 text-white hover:bg-white/20 rounded-md"
                        onClick={() => setConfirmDel(null)}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-2 border-t border-border/40 bg-card">
                  <p className="text-xs font-medium truncate text-foreground" title={asset.public_id}>
                    {formatMediaName(asset.public_id)}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mt-0.5">
                    <span className="uppercase">{asset.format || 'file'}</span>
                    <span>{formatBytes(asset.bytes || 0)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <MediaUploadModal
        isOpen={showUpload}
        onClose={() => {
          setShowUpload(false);
          qc.invalidateQueries({ queryKey: ['media-assets'] });
        }}
      />

      <AnimatePresence>
        {previewAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setPreviewAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-card border border-border/60 rounded-xl overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-foreground truncate text-sm">
                    {previewAsset.public_id.split('/').pop()}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 gap-1 text-primary text-xs rounded-md"
                    onClick={() => handleCopy(previewAsset.secure_url, previewAsset.public_id)}
                  >
                    {copiedId === previewAsset.public_id ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    <span>Salin URL</span>
                  </Button>
                  <Button
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

              <div className="p-3 border-t border-border/50 bg-muted/20 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
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
    </div>
  );
}
