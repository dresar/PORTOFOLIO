import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, Plus, Trash2, CheckCircle2, Loader2, Eye, EyeOff,
  Shield, TestTube2, Save, X, AlertCircle, Image, Upload,
  RefreshCw, Copy, Check, Search, ZoomIn, Play, Video,
  Server
} from 'lucide-react';
import { cloudinaryApi, formatBytes, type CloudinaryConfig, type CloudinaryAsset } from '../../services/cloudinaryApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { cn, getCloudinaryVideoThumbnail } from '@/lib/utils';
import { CloudinaryUploadModal } from './CloudinaryUploadModal';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';

const MAX_CONFIGS = 5;

function GitHubCdnCard() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);
  const { toast } = useToast();

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await cloudinaryApi.testConfig(9999);
      if (res.success) {
        setTestResult('ok');
        toast({ title: 'Koneksi GitHub CDN Berhasil', description: `Repo: ${res.repo || 'dresar/PORTOFOLIO'} (${res.cdn || 'jsDelivr Edge'})` });
      } else {
        setTestResult('fail');
        toast({ variant: 'destructive', title: 'Koneksi Gagal', description: res.error });
      }
    } catch {
      setTestResult('fail');
      toast({ variant: 'destructive', title: 'Gagal uji koneksi GitHub' });
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  return (
    <div className="relative rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-base text-foreground">GitHub CDN (jsDelivr Edge)</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">Default / Utama</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Penyimpanan berkas media langsung di repository GitHub publik dengan akselerasi Edge CDN global jsDelivr.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          className={cn(
            'h-8 text-xs gap-1.5 shrink-0 border-emerald-500/30',
            testResult === 'ok' ? 'border-emerald-600 text-emerald-600' : testResult === 'fail' ? 'border-red-500 text-red-600' : ''
          )}
          onClick={handleTest}
          disabled={testing}
        >
          {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube2 className="w-3.5 h-3.5" />}
          {testing ? 'Menguji...' : testResult === 'ok' ? 'Koneksi Aktif ✓' : testResult === 'fail' ? 'Gagal ✗' : 'Uji Koneksi GitHub'}
        </Button>
      </div>

      <div className="mt-4 pt-4 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-background/60 border border-emerald-500/10">
          <p className="text-muted-foreground text-[11px]">Repository</p>
          <p className="font-mono font-medium text-foreground mt-0.5">dresar/PORTOFOLIO</p>
        </div>
        <div className="p-2.5 rounded-xl bg-background/60 border border-emerald-500/10">
          <p className="text-muted-foreground text-[11px]">Branch & Target</p>
          <p className="font-mono font-medium text-foreground mt-0.5">main (public/uploads)</p>
        </div>
        <div className="p-2.5 rounded-xl bg-background/60 border border-emerald-500/10">
          <p className="text-muted-foreground text-[11px]">Edge Network</p>
          <p className="font-mono font-medium text-foreground mt-0.5">cdn.jsdelivr.net</p>
        </div>
        <div className="p-2.5 rounded-xl bg-background/60 border border-emerald-500/10">
          <p className="text-muted-foreground text-[11px]">Akun Pemilik</p>
          <p className="font-mono font-medium text-foreground mt-0.5">eka.ckp16799</p>
        </div>
      </div>
    </div>
  );
}

function ConfigCard({ config, onActivate, onDelete }: {
  config: CloudinaryConfig;
  onActivate: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);
  const { toast } = useToast();

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await cloudinaryApi.testConfig(config.id);
      if (res.success) {
        setTestResult('ok');
        toast({ title: 'Koneksi Cloudinary Berhasil', description: `Cloud Name: ${res.cloud_name}` });
      } else {
        setTestResult('fail');
        toast({ variant: 'destructive', title: 'Koneksi Gagal', description: res.error });
      }
    } catch {
      setTestResult('fail');
      toast({ variant: 'destructive', title: 'Gagal uji koneksi Cloudinary' });
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'relative rounded-xl border p-4 transition-all',
        config.is_active
          ? 'border-sky-500/60 bg-sky-500/5 shadow-sm'
          : 'border-border/50 bg-card hover:border-border'
      )}
    >
      {config.is_active && (
        <span className="absolute -top-2.5 left-4 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-600 text-white">
          Aktif
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.is_active ? 'bg-sky-500/20 text-sky-600' : 'bg-muted text-muted-foreground')}>
            <Cloud className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{config.label || config.cloud_name}</p>
            <p className="text-xs text-muted-foreground">Cloud: <span className="font-mono">{config.cloud_name}</span></p>
            <p className="text-xs text-muted-foreground">Key: <span className="font-mono">{config.api_key}</span></p>
            <p className="text-xs text-muted-foreground">Secret: <span className="font-mono tracking-widest">{config.api_secret}</span></p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          {!config.is_active && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onActivate(config.id)}>
              <CheckCircle2 className="w-3 h-3" /> Aktifkan
            </Button>
          )}
          <Button
            size="sm" variant="outline"
            className={cn('h-7 text-xs gap-1', testResult === 'ok' ? 'border-green-500 text-green-600' : testResult === 'fail' ? 'border-red-500 text-red-600' : '')}
            onClick={handleTest} disabled={testing}
          >
            {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <TestTube2 className="w-3 h-3" />}
            {testing ? 'Uji...' : testResult === 'ok' ? 'OK ✓' : testResult === 'fail' ? 'Gagal ✗' : 'Uji'}
          </Button>
          <Button
            size="sm" variant="outline"
            className="h-7 text-xs gap-1 hover:bg-destructive hover:text-white hover:border-destructive"
            onClick={() => onDelete(config.id)}
          >
            <Trash2 className="w-3 h-3" /> Hapus
          </Button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="w-3 h-3 text-green-500" />
        <span>Tersimpan terenkripsi di database Neon · Ditambahkan {new Date(config.created_at).toLocaleDateString('id')}</span>
      </div>
    </motion.div>
  );
}

function AddConfigForm({ onSuccess, count }: { onSuccess: () => void; count: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState({ cloud_name: '', api_key: '', api_secret: '', label: '' });
  const [showSecret, setShowSecret] = useState(false);

  const mutation = useMutation({
    mutationFn: () => cloudinaryApi.addConfig(form),
    onSuccess: () => {
      toast({ title: 'Konfigurasi Ditambahkan', description: `Akun ${form.cloud_name} berhasil disimpan.` });
      setForm({ cloud_name: '', api_key: '', api_secret: '', label: '' });
      qc.invalidateQueries({ queryKey: ['cloudinary-configs'] });
      onSuccess();
    },
    onError: (err: any) => {
      toast({ variant: 'destructive', title: 'Gagal menyimpan', description: err?.response?.data?.error || err.message });
    }
  });

  const disabled = count >= MAX_CONFIGS;

  return (
    <Card className={cn(disabled && 'opacity-60 pointer-events-none')}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Tambah Akun Cloudinary
        </CardTitle>
        <CardDescription>
          {disabled
            ? `Batas maksimal ${MAX_CONFIGS} akun Cloudinary tercapai. Hapus salah satu akun untuk menambah baru.`
            : `Tersisa ${MAX_CONFIGS - count} slot akun dari ${MAX_CONFIGS} maksimum.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Label Akun</Label>
            <Input placeholder="" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Cloud Name <span className="text-destructive">*</span></Label>
            <Input placeholder="" value={form.cloud_name} onChange={e => setForm(p => ({ ...p, cloud_name: e.target.value }))} className="h-8 text-sm font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">API Key <span className="text-destructive">*</span></Label>
            <Input placeholder="" value={form.api_key} onChange={e => setForm(p => ({ ...p, api_key: e.target.value }))} className="h-8 text-sm font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">API Secret <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                type={showSecret ? 'text' : 'password'}
                placeholder=""
                value={form.api_secret}
                onChange={e => setForm(p => ({ ...p, api_secret: e.target.value }))}
                className="h-8 text-sm font-mono pr-9"
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowSecret(p => !p)}
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          Kredensial disimpan terenkripsi di database Neon PostgreSQL.
        </div>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !form.cloud_name || !form.api_key || !form.api_secret}
          size="sm" className="gap-1.5"
        >
          {mutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Simpan Konfigurasi
        </Button>
      </CardContent>
    </Card>
  );
}

function MediaGrid({ configs, activeConfig, onActivate }: {
  configs: CloudinaryConfig[];
  activeConfig?: CloudinaryConfig;
  onActivate: (id: number) => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<CloudinaryAsset | null>(null);
  const [resourceTypeTab, setResourceTypeTab] = useState<'image' | 'video'>('image');
  const [providerFilter, setProviderFilter] = useState<'all' | 'github' | 'cloudinary'>('all');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cloudinary-assets', activeConfig?.id, cursor, resourceTypeTab, providerFilter],
    queryFn: () => cloudinaryApi.listAssets({ 
      resource_type: resourceTypeTab, 
      max_results: 50,
      next_cursor: cursor,
      provider: providerFilter,
      config_id: activeConfig?.id !== 9999 ? activeConfig?.id : undefined
    }),
    staleTime: 30_000,
  });

  const assets: CloudinaryAsset[] = data?.resources || [];
  const nextCursor = data?.next_cursor;

  const deleteMutation = useMutation({
    mutationFn: (asset: CloudinaryAsset) => cloudinaryApi.deleteAsset(asset.public_id, resourceTypeTab, asset.provider, asset.sha),
    onSuccess: () => {
      toast({ title: 'Aset Dihapus', description: 'Berkas berhasil dihapus dari penyimpanan.' });
      qc.invalidateQueries({ queryKey: ['cloudinary-assets'] });
      setConfirmDel(null);
    },
    onError: (e: any) => toast({ variant: 'destructive', title: 'Gagal hapus', description: e?.response?.data?.error })
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
    if (window.confirm(`Hapus permanen ${selectedIds.size} item yang dipilih?`)) {
      const items = assets.filter(a => selectedIds.has(a.public_id));
      for (const item of items) {
        deleteMutation.mutate(item);
      }
      setSelectedIds(new Set());
    }
  };

  const handleNextPage = () => {
    if (nextCursor) {
      setCursorHistory(prev => [...prev, cursor]);
      setCursor(nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (cursorHistory.length > 0) {
      const prev = [...cursorHistory];
      const last = prev.pop();
      setCursorHistory(prev);
      setCursor(last);
    }
  };

  const filtered = assets.filter(a => !search || a.public_id.toLowerCase().includes(search.toLowerCase()));

  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Link CDN Disalin' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border/50">
          <Button
            type="button"
            variant={providerFilter === 'all' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs font-medium px-3"
            onClick={() => { setProviderFilter('all'); setCursor(undefined); setCursorHistory([]); }}
          >
            Semua Penyimpanan
          </Button>
          <Button
            type="button"
            variant={providerFilter === 'github' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs font-medium gap-1.5 px-3"
            onClick={() => { setProviderFilter('github'); setCursor(undefined); setCursorHistory([]); }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            GitHub CDN
          </Button>
          <Button
            type="button"
            variant={providerFilter === 'cloudinary' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs font-medium gap-1.5 px-3"
            onClick={() => { setProviderFilter('cloudinary'); setCursor(undefined); setCursorHistory([]); }}
          >
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Cloudinary
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
              <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={deleteMutation.isPending} className="h-8 gap-1.5 px-3 text-xs">
                {deleteMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Hapus {selectedIds.size} Item
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="h-8 px-2 text-xs">Batal</Button>
            </div>
          )}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="h-8 w-8 p-0 shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" onClick={() => setShowUpload(true)} className="gap-1.5 h-8 text-xs shrink-0">
            <Upload className="w-3.5 h-3.5" /> Upload Media
          </Button>
        </div>
      </div>

      {providerFilter === 'cloudinary' && configs.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-muted-foreground shrink-0">Akun Cloudinary:</span>
          {configs.map((cfg) => (
            <button
              key={cfg.id}
              onClick={() => onActivate(cfg.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border",
                cfg.is_active
                  ? "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30 shadow-sm"
                  : "bg-muted/40 text-muted-foreground border-border/40 hover:border-sky-500/30"
              )}
            >
              <Cloud className="w-3 h-3" />
              {cfg.label || cfg.cloud_name}
              {cfg.is_active && <CheckCircle2 className="w-3 h-3 text-sky-500" />}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
            <Button
              type="button"
              variant={resourceTypeTab === 'image' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs gap-1.5 font-medium"
              onClick={() => { setResourceTypeTab('image'); setCursor(undefined); setCursorHistory([]); }}
            >
              <Image className="w-3.5 h-3.5" /> Gambar
            </Button>
            <Button
              type="button"
              variant={resourceTypeTab === 'video' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs gap-1.5 font-medium"
              onClick={() => { setResourceTypeTab('video'); setCursor(undefined); setCursorHistory([]); }}
            >
              <Video className="w-3.5 h-3.5 text-purple-400" /> Video CDN
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="h-7 text-xs gap-2 text-muted-foreground hover:text-foreground">
            <div className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors", selectedIds.size === assets.length && assets.length > 0 ? "bg-primary border-primary" : "border-border")}>
              {selectedIds.size === assets.length && assets.length > 0 && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            Pilih Semua
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
          {filtered.length} Aset Terdeteksi
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Memuat media aset...</span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <div>
            <p className="font-medium text-sm">Gagal memuat media</p>
            <p className="text-xs text-muted-foreground mt-1">Periksa koneksi CDN atau konfigurasi Cloudinary aktif.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>Coba Lagi</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-center border border-dashed rounded-2xl">
          <Image className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{search ? 'Tidak ada hasil pencarian' : 'Belum ada media tersimpan.'}</p>
          {!search && <Button size="sm" onClick={() => setShowUpload(true)}>Upload Sekarang</Button>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(asset => (
              <motion.div
                key={asset.public_id}
                layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "group relative rounded-2xl overflow-hidden border transition-all duration-300",
                  selectedIds.has(asset.public_id) 
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                    : "border-border/40 bg-muted/30 hover:border-primary/50 hover:shadow-xl"
                )}
              >
                <div className="aspect-square overflow-hidden cursor-pointer relative" onClick={() => toggleSelect(asset.public_id)}>
                  {asset.resource_type === 'video' ? (
                    <div className="w-full h-full bg-black flex items-center justify-center relative">
                      <img 
                        src={getCloudinaryVideoThumbnail(asset.secure_url)} 
                        alt={asset.public_id} 
                        className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110" 
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 bg-purple-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md z-10">
                        <Video className="w-3 h-3" /> VIDEO
                      </div>
                      <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white pointer-events-none z-10">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                  ) : (
                    <img src={asset.secure_url} alt={asset.public_id} className={cn("w-full h-full object-cover transition-transform duration-500", selectedIds.has(asset.public_id) ? "scale-100 opacity-60" : "group-hover:scale-110")} loading="lazy" />
                  )}
                  
                  <div className="absolute top-2.5 right-2.5 z-10">
                    {asset.provider === 'github' ? (
                      <span className="bg-emerald-600/90 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow backdrop-blur-sm">
                        <Server className="w-2.5 h-2.5" /> GitHub CDN
                      </span>
                    ) : (
                      <span className="bg-sky-600/90 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow backdrop-blur-sm">
                        <Cloud className="w-2.5 h-2.5" /> {asset._account || 'Cloudinary'}
                      </span>
                    )}
                  </div>

                  <div className={cn(
                    "absolute top-3 left-3 z-20 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
                    selectedIds.has(asset.public_id) ? "bg-primary border-primary scale-110" : "bg-black/20 border-white/50 opacity-0 group-hover:opacity-100"
                  )}>
                    {selectedIds.has(asset.public_id) && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </div>

                  {!selectedIds.has(asset.public_id) && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPreviewImage(asset); }}
                        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors"
                        title="Lihat Detail"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopy(asset.secure_url, asset.public_id); }}
                        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors"
                        title="Salin Link"
                      >
                        {copiedId === asset.public_id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setConfirmDel(asset.public_id); }}
                        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-destructive transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {confirmDel === asset.public_id && (
                  <div className="absolute inset-0 z-20 bg-destructive/90 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center text-white gap-3">
                    <AlertCircle className="w-8 h-8" />
                    <p className="text-xs font-semibold">Hapus permanen berkas ini?</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => deleteMutation.mutate(asset)} disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? '...' : 'Hapus'}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-white hover:bg-white/10" onClick={() => setConfirmDel(null)}>Batal</Button>
                    </div>
                  </div>
                )}

                <div className="p-3 border-t border-border/40 bg-card/50 backdrop-blur-sm">
                  <p className="text-xs font-semibold truncate text-foreground/90 mb-0.5">{asset.public_id.split('/').pop()}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-tight">
                    <span>{asset.width}×{asset.height}</span>
                    <span>{formatBytes(asset.bytes)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 pt-6 pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={cursorHistory.length === 0 || isLoading}
              className="gap-2 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 rotate-180" /> Sebelumnya
            </Button>
            <div className="text-xs font-medium text-muted-foreground">
              Halaman {cursorHistory.length + 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!nextCursor || isLoading}
              className="gap-2 text-xs"
            >
              Selanjutnya <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </>
      )}

      <CloudinaryUploadModal
        isOpen={showUpload}
        onClose={() => { setShowUpload(false); qc.invalidateQueries({ queryKey: ['cloudinary-assets'] }); }}
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
                  {previewImage.resource_type !== 'video' && (
                    <Button size="sm" variant="secondary" asChild className="h-8 gap-1.5 text-xs">
                      <a href={previewImage.secure_url} target="_blank" rel="noreferrer" download>
                        <Upload className="w-3.5 h-3.5 rotate-180" />
                        <span className="hidden sm:inline">Download</span>
                      </a>
                    </Button>
                  )}
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
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">Format:</span>
                    <span>{previewImage.format.toUpperCase()}</span>
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
    </div>
  );
}

export default function CloudinaryPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('media');

  const { data: rawConfigs = [], isLoading } = useQuery<CloudinaryConfig[]>({
    queryKey: ['cloudinary-configs'],
    queryFn: cloudinaryApi.getConfigs,
  });

  const cloudinaryConfigs = rawConfigs.filter(c => c.id !== 9999);
  const activeCldConfig = cloudinaryConfigs.find(c => c.is_active);

  const activateMutation = useMutation({
    mutationFn: (id: number) => cloudinaryApi.activateConfig(id),
    onSuccess: (res) => {
      toast({ title: 'Akun Diaktifkan', description: `Akun "${res.active.label || res.active.cloud_name}" sekarang aktif.` });
      qc.invalidateQueries({ queryKey: ['cloudinary-configs'] });
      qc.invalidateQueries({ queryKey: ['cloudinary-assets'] });
    },
    onError: () => toast({ variant: 'destructive', title: 'Gagal mengaktifkan konfigurasi' })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => cloudinaryApi.deleteConfig(id),
    onSuccess: () => {
      toast({ title: 'Konfigurasi Dihapus' });
      qc.invalidateQueries({ queryKey: ['cloudinary-configs'] });
    },
    onError: () => toast({ variant: 'destructive', title: 'Gagal menghapus konfigurasi' })
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Cloud className="w-8 h-8 text-primary" />
            Media & CDN Storage
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Kelola media dan aset portofolio via GitHub CDN (jsDelivr Edge) & Cloudinary Multi-Akun (maks. {MAX_CONFIGS} akun)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">GitHub CDN</span>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600">Aktif</Badge>
          </div>
          {activeCldConfig && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-sky-700 dark:text-sky-400 font-medium">Cloudinary: {activeCldConfig.label || activeCldConfig.cloud_name}</span>
              <Badge variant="outline" className="text-[10px] border-sky-500/30 text-sky-600">Aktif</Badge>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="media" className="gap-1.5"><Image className="w-3.5 h-3.5" /> Media</TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5"><Shield className="w-3.5 h-3.5" /> Konfigurasi</TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="mt-4">
          <MediaGrid 
            configs={cloudinaryConfigs} 
            activeConfig={activeCldConfig} 
            onActivate={id => activateMutation.mutate(id)} 
          />
        </TabsContent>

        <TabsContent value="config" className="mt-4 space-y-6">
          <GitHubCdnCard />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-sky-500" /> Cloudinary Multi-Akun
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hubungkan hingga {MAX_CONFIGS} akun Cloudinary untuk penyimpanan alternatif dan pemrosesan video/gambar.
                </p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full border">
                {cloudinaryConfigs.length}/{MAX_CONFIGS} Akun Digunakan
              </span>
            </div>

            <Card>
              <CardContent className="py-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full transition-colors', cloudinaryConfigs.length >= MAX_CONFIGS ? 'bg-destructive' : cloudinaryConfigs.length >= 3 ? 'bg-amber-500' : 'bg-sky-500')}
                    initial={{ width: 0 }}
                    animate={{ width: `${(cloudinaryConfigs.length / MAX_CONFIGS) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </CardContent>
            </Card>

            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-3">
                {cloudinaryConfigs.map(cfg => (
                  <ConfigCard
                    key={cfg.id}
                    config={cfg}
                    onActivate={id => activateMutation.mutate(id)}
                    onDelete={id => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}

            <AddConfigForm count={cloudinaryConfigs.length} onSuccess={() => setActiveTab('media')} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
