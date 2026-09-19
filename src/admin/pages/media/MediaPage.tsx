import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Folder, FolderPlus, Trash2, Loader2,
  AlertCircle, Upload, ArrowLeft,
  RefreshCw, Copy, Check, Search, ZoomIn, Play, Video,
  FileText, ImageIcon, X, MoveRight, CornerDownRight,
  ExternalLink, ChevronDown
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
import { useMediaFolderStore, DEFAULT_FOLDERS } from '@/admin/store/mediaFolderStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const FOLDER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Semua: { bg: 'bg-zinc-500/10 dark:bg-zinc-500/20', text: 'text-zinc-600 dark:text-zinc-300', border: 'border-zinc-500/30' },
  Umum: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
  Projects: { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30' },
  Certificates: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
  Blog: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30' },
  Profile: { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30' },
  Dokumen: { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/30' },
};

function getFolderStyle(name: string) {
  return FOLDER_COLORS[name] || {
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/30'
  };
}

export default function MediaPage() {
  const { toast } = useToast();
  const { openPdfPreviewModal } = useModalStore();
  const qc = useQueryClient();

  const {
    getAllFolders,
    getFileFolder,
    currentFolder,
    setCurrentFolder,
    moveFiles,
    addFolder,
    deleteFolder,
    initFolders
  } = useMediaFolderStore();

  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [resourceTypeTab, setResourceTypeTab] = useState<'all' | 'image' | 'video' | 'raw'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetMoveFolder, setTargetMoveFolder] = useState<string>('Umum');
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [folderSearch, setFolderSearch] = useState('');
  const [moveSearch, setMoveSearch] = useState('');

  useEffect(() => {
    initFolders();
  }, [initFolders]);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['media-assets', resourceTypeTab],
    queryFn: () => mediaApi.listAssets({
      resource_type: resourceTypeTab === 'all' ? undefined : resourceTypeTab
    }),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const assets: MediaAsset[] = useMemo(() => {
    const rawAssets: MediaAsset[] = data?.resources || [];
    return sortAssetsNewestFirst(rawAssets);
  }, [data?.resources]);

  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => mediaApi.deleteAsset([publicId]),
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

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => mediaApi.deleteAsset(ids),
    onSuccess: (_, ids) => {
      toast({ title: `✓ ${ids.length} berkas dihapus` });
      qc.invalidateQueries({ queryKey: ['media-assets'] });
      setSelectedIds(new Set());
    },
    onError: (e: any) => toast({
      variant: 'destructive',
      title: 'Gagal menghapus berkas',
      description: e?.response?.data?.error || e.message
    })
  });

  const allFolders = getAllFolders();

  const filteredFolders = useMemo(() => {
    if (!folderSearch.trim()) return allFolders;
    const q = folderSearch.trim().toLowerCase();
    return allFolders.filter(f => f.toLowerCase().includes(q));
  }, [allFolders, folderSearch]);

  const filteredMoveFolders = useMemo(() => {
    if (!moveSearch.trim()) return allFolders;
    const q = moveSearch.trim().toLowerCase();
    return allFolders.filter(f => f.toLowerCase().includes(q));
  }, [allFolders, moveSearch]);

  const folderItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of allFolders) {
      counts[f] = 0;
    }
    for (const a of assets) {
      const f = getFileFolder(a.public_id);
      counts[f] = (counts[f] || 0) + 1;
    }
    return counts;
  }, [allFolders, assets, getFileFolder]);

  const filtered = useMemo(() => {
    return assets.filter(a => {
      if (currentFolder && currentFolder !== 'all') {
        const itemFolder = getFileFolder(a.public_id);
        if (itemFolder !== currentFolder) return false;
      }

      const matchSearch = !search || a.public_id.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      if (resourceTypeTab === 'all') return true;
      if (resourceTypeTab === 'image') return a.resource_type === 'image' || (!a.resource_type && !a.public_id.endsWith('.pdf'));
      if (resourceTypeTab === 'raw') return a.resource_type === 'raw' || a.format === 'pdf' || a.public_id.toLowerCase().endsWith('.pdf');
      if (resourceTypeTab === 'video') return a.resource_type === 'video' || ['mp4', 'webm', 'mov'].includes(a.format || '');
      return true;
    });
  }, [assets, currentFolder, getFileFolder, search, resourceTypeTab]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(a => a.public_id)));
    }
  };

  const handleBulkDelete = () => {
    if (!selectedIds.size) return;
    if (window.confirm(`Hapus permanen ${selectedIds.size} berkas terpilih?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedIds));
    }
  };

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

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const ok = await addFolder(newFolderName.trim());
    if (ok) {
      toast({ title: `✓ Folder "${newFolderName.trim()}" dibuat` });
      setNewFolderName('');
      setIsNewFolderOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Gagal membuat folder', description: 'Nama folder sudah ada atau tidak valid.' });
    }
  };

  const handleDeleteFolder = async (e: React.MouseEvent, folderName: string) => {
    e.stopPropagation();
    if (window.confirm(`Hapus folder "${folderName}"? Berkas di dalamnya akan dipindahkan ke folder Umum.`)) {
      await deleteFolder(folderName);
      toast({ title: `✓ Folder "${folderName}" dihapus` });
    }
  };

  const handleDropOnFolder = async (folderName: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolder(null);

    const publicId = e.dataTransfer.getData('text/plain');
    if (!publicId) return;

    const idsToMove = selectedIds.has(publicId) ? Array.from(selectedIds) : [publicId];
    await moveFiles(idsToMove, folderName);
    setSelectedIds(new Set());
    toast({
      title: `✓ ${idsToMove.length} berkas dipindahkan`,
      description: `Disimpan ke folder ${folderName}.`
    });
  };

  const handleMoveSelected = async () => {
    if (!selectedIds.size || !targetMoveFolder) return;
    const idsToMove = Array.from(selectedIds);
    await moveFiles(idsToMove, targetMoveFolder);
    setSelectedIds(new Set());
    setIsMoveModalOpen(false);
    toast({
      title: `✓ ${idsToMove.length} berkas dipindahkan`,
      description: `Disimpan ke folder ${targetMoveFolder}.`
    });
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
            Kelola berkas media dan dokumen portofolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsNewFolderOpen(true)}
            className="h-8 text-xs gap-1.5 px-3 rounded-lg active:scale-[0.98] shrink-0"
            title="Tambah folder"
          >
            <FolderPlus className="size-3.5 text-primary" />
            <span>Folder</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={async () => {
              await qc.invalidateQueries({ queryKey: ['media-assets'] });
              refetch();
            }}
            disabled={isFetching}
            className="h-8 size-8 p-0 rounded-lg shrink-0"
            title="Muat ulang"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setShowUpload(true)}
            className="h-8 text-xs gap-1.5 px-3 rounded-lg active:scale-[0.98] shrink-0"
          >
            <Upload className="size-3.5" />
            <span>Unggah</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Popover open={isFolderOpen} onOpenChange={setIsFolderOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverFolder(currentFolder && currentFolder !== 'all' ? currentFolder : 'Umum');
                }}
                onDragLeave={() => setDragOverFolder(null)}
                onDrop={(e) => {
                  const target = currentFolder && currentFolder !== 'all' ? currentFolder : 'Umum';
                  handleDropOnFolder(target, e);
                }}
                className={cn(
                  "h-8 px-2.5 text-xs rounded-lg gap-2 border-border/80 bg-card hover:bg-accent/50 font-medium active:scale-[0.98] transition-all",
                  dragOverFolder && "border-primary ring-2 ring-primary/40 bg-primary/10"
                )}
              >
                <div className={cn(
                  'size-5 rounded flex items-center justify-center shrink-0',
                  getFolderStyle(currentFolder && currentFolder !== 'all' ? currentFolder : 'Semua').bg,
                  getFolderStyle(currentFolder && currentFolder !== 'all' ? currentFolder : 'Semua').text
                )}>
                  <Folder className="size-3 fill-current/20" />
                </div>
                <span className="font-semibold text-foreground max-w-[140px] truncate">
                  {currentFolder && currentFolder !== 'all' ? currentFolder : 'Semua Folder'}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
                  {currentFolder && currentFolder !== 'all' ? (folderItemCounts[currentFolder] || 0) : assets.length}
                </span>
                <ChevronDown className="size-3 text-muted-foreground ml-auto" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-2 rounded-xl border border-border/80 bg-popover shadow-xl">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari"
                    value={folderSearch}
                    onChange={(e) => setFolderSearch(e.target.value)}
                    className="pl-8 pr-7 h-7 text-xs rounded-md font-mono"
                    autoFocus
                  />
                  {folderSearch && (
                    <button
                      type="button"
                      onClick={() => setFolderSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between px-1 text-[10px] font-mono text-muted-foreground">
                  <span>FOLDER ({allFolders.length})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFolderOpen(false);
                      setIsNewFolderOpen(true);
                    }}
                    className="text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    <FolderPlus className="size-3" /> Baru
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentFolder('all');
                      setIsFolderOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors select-none text-left",
                      (!currentFolder || currentFolder === 'all')
                        ? "bg-primary/15 text-primary font-semibold"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-5 rounded bg-zinc-500/15 text-zinc-500 flex items-center justify-center shrink-0">
                        <Folder className="size-3" />
                      </div>
                      <span className="truncate">Semua Folder</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
                        {assets.length}
                      </span>
                      {(!currentFolder || currentFolder === 'all') && <Check className="size-3.5 text-primary" />}
                    </div>
                  </button>

                  <div className="h-px bg-border/60 my-1" />

                  {filteredFolders.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground text-center py-4">Folder tidak ditemukan</p>
                  ) : (
                    filteredFolders.map(f => {
                      const style = getFolderStyle(f);
                      const count = folderItemCounts[f] || 0;
                      const isSelected = currentFolder === f;
                      const isDefault = DEFAULT_FOLDERS.includes(f as any);

                      return (
                        <div
                          key={f}
                          onClick={() => {
                            setCurrentFolder(f);
                            setIsFolderOpen(false);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            setDragOverFolder(f);
                          }}
                          onDragLeave={() => setDragOverFolder(null)}
                          onDrop={(e) => handleDropOnFolder(f, e)}
                          className={cn(
                            "group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors select-none",
                            isSelected
                              ? "bg-primary/15 text-primary font-semibold"
                              : "hover:bg-muted text-foreground",
                            dragOverFolder === f && "ring-2 ring-primary bg-primary/20"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={cn('size-5 rounded flex items-center justify-center shrink-0', style.bg, style.text)}>
                              <Folder className="size-3 fill-current/20" />
                            </div>
                            <span className="truncate">{f}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-full">
                              {count}
                            </span>
                            {isSelected && <Check className="size-3.5 text-primary" />}
                            {!isDefault && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFolder(e, f);
                                }}
                                className="size-5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
                                title="Hapus folder"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {currentFolder && currentFolder !== 'all' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFolder('all')}
              className="h-8 px-2 text-xs rounded-lg text-muted-foreground hover:text-foreground gap-1"
              title="Kembali ke semua folder"
            >
              <X className="size-3" />
              <span>Semua</span>
            </Button>
          )}

          <div className="h-4 w-px bg-border/60 mx-0.5 hidden sm:block" />

          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50">
            <Button
              type="button"
              variant={resourceTypeTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              className="h-6 text-xs font-medium px-2 rounded-md"
              onClick={() => setResourceTypeTab('all')}
            >
              Semua
            </Button>
            <Button
              type="button"
              variant={resourceTypeTab === 'image' ? 'default' : 'ghost'}
              size="sm"
              className="h-6 text-xs gap-1 font-medium px-2 rounded-md"
              onClick={() => setResourceTypeTab('image')}
            >
              <ImageIcon className="size-3" /> Gambar
            </Button>
            <Button
              type="button"
              variant={resourceTypeTab === 'raw' ? 'default' : 'ghost'}
              size="sm"
              className="h-6 text-xs gap-1 font-medium px-2 rounded-md"
              onClick={() => setResourceTypeTab('raw')}
            >
              <FileText className="size-3 text-red-500" /> Dokumen
            </Button>
            <Button
              type="button"
              variant={resourceTypeTab === 'video' ? 'default' : 'ghost'}
              size="sm"
              className="h-6 text-xs gap-1 font-medium px-2 rounded-md"
              onClick={() => setResourceTypeTab('video')}
            >
              <Video className="size-3 text-purple-400" /> Video
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-2 py-1 rounded-lg">
              <span className="text-xs font-semibold text-primary px-1">
                {selectedIds.size} dipilih
              </span>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsMoveModalOpen(true)}
                className="h-7 gap-1 px-2 text-xs rounded-md border-primary/40 text-primary hover:bg-primary hover:text-white"
              >
                <MoveRight className="size-3" /> Pindah
              </Button>

              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="h-7 gap-1 px-2 text-xs rounded-md active:scale-[0.98]"
              >
                {bulkDeleteMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                Hapus
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
                className="h-7 px-1.5 text-xs rounded-md text-muted-foreground"
              >
                Batal
              </Button>
            </div>
          )}

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-8 text-xs rounded-lg font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleSelectAll}
          className="h-7 text-xs gap-2 text-muted-foreground hover:text-foreground rounded-md"
        >
          <div className={cn(
            'size-3.5 rounded border flex items-center justify-center transition-colors',
            selectedIds.size === filtered.length && filtered.length > 0 ? 'bg-primary border-primary' : 'border-border'
          )}>
            {selectedIds.size === filtered.length && filtered.length > 0 && <Check className="size-2.5 text-white" />}
          </div>
          <span>Pilih semua ({filtered.length})</span>
        </Button>
        <p className="text-[11px] text-muted-foreground font-mono">
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
          <Button type="button" size="sm" variant="outline" onClick={() => refetch()} className="rounded-lg h-8 text-xs">
            Coba Lagi
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 gap-3 text-center border border-dashed rounded-xl p-6">
          <FolderOpen className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-sm text-foreground">
              {search
                ? 'Tidak ada hasil pencarian'
                : currentFolder && currentFolder !== 'all'
                ? `Folder "${currentFolder}" masih kosong`
                : 'Belum ada media tersimpan'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {search
                ? 'Coba gunakan kata kunci lain'
                : 'Tarik & lepas gambar ke sini atau unggah berkas baru'}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setShowUpload(true)}
            className="rounded-lg h-8 text-xs gap-1.5"
          >
            <Upload className="size-3.5" /> Unggah Sekarang
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filtered.map(asset => {
            const isPdf = asset.format === 'pdf' || asset.resource_type === 'raw' || /\.pdf($|\?)/i.test(asset.secure_url || asset.url);
            const isVideo = asset.resource_type === 'video' || isVideoUrl(asset.secure_url || asset.url) || ['mp4', 'webm', 'mov'].includes(asset.format || '');
            const itemFolder = getFileFolder(asset.public_id);
            const folderStyle = getFolderStyle(itemFolder);

            return (
              <motion.div
                key={asset.public_id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', asset.public_id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className={cn(
                  'group relative rounded-xl overflow-hidden border transition-all duration-200 bg-card cursor-grab active:cursor-grabbing',
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
                    <AlertCircle className="size-5" />
                    <p className="text-xs font-semibold">Hapus berkas?</p>
                    <div className="flex gap-1.5 w-full">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs flex-1 rounded-md"
                        onClick={() => deleteMutation.mutate(asset.public_id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : 'Hapus'}
                      </Button>
                      <Button
                        type="button"
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

                <div className="p-2 border-t border-border/40 bg-card space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-medium truncate text-foreground flex-1" title={asset.public_id}>
                      {formatMediaName(asset.public_id)}
                    </p>
                    <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0 border', folderStyle.bg, folderStyle.text, folderStyle.border)}>
                      {itemFolder}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span className="uppercase">{asset.format || 'file'}</span>
                    <span>{formatBytes(asset.bytes || 0)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Folder Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              Nama folder pengelompokan.
            </p>
            <Input
              placeholder="Nama"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
              }}
              className="h-9 text-xs rounded-lg"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewFolderOpen(false)}
              className="rounded-lg h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="rounded-lg h-8 text-xs"
            >
              Buat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMoveModalOpen} onOpenChange={setIsMoveModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pindah Berkas</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari"
                value={moveSearch}
                onChange={(e) => setMoveSearch(e.target.value)}
                className="pl-8 pr-7 h-8 text-xs rounded-lg font-mono"
              />
              {moveSearch && (
                <button
                  type="button"
                  onClick={() => setMoveSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {filteredMoveFolders.length === 0 ? (
                <p className="col-span-2 text-xs text-muted-foreground text-center py-4">Folder tidak ditemukan</p>
              ) : (
                filteredMoveFolders.map(f => {
                  const style = getFolderStyle(f);
                  const isSelected = targetMoveFolder === f;
                  return (
                    <div
                      key={f}
                      onClick={() => setTargetMoveFolder(f)}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all select-none',
                        isSelected
                          ? 'border-primary ring-1 ring-primary bg-primary/10'
                          : 'border-border/70 hover:border-primary/40 bg-card'
                      )}
                    >
                      <div className={cn('size-6 rounded flex items-center justify-center shrink-0', style.bg, style.text)}>
                        <Folder className="size-3.5 fill-current/20" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{f}</p>
                        <p className="text-[10px] text-muted-foreground">{folderItemCounts[f] || 0} berkas</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMoveModalOpen(false)}
              className="rounded-lg h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleMoveSelected}
              className="rounded-lg h-8 text-xs"
            >
              Pindah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaUploadModal
        isOpen={showUpload}
        targetFolder={currentFolder && currentFolder !== 'all' ? currentFolder : 'Projects'}
        onClose={() => {
          setShowUpload(false);
          qc.invalidateQueries({ queryKey: ['media-assets'] });
          refetch();
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
    </div>
  );
}
