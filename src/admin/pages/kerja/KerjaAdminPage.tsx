import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck, Key, FileText, Plus, Trash2, Edit3,
  ExternalLink, RefreshCw, Upload,
  Eye, EyeOff, Save, Loader2, ArrowLeft,
  Sparkles, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { mediaApi, fileToBase64, formatBytes } from '../../services/mediaApi';
import { adminApi } from '../../services/api';
import { cn } from '@/lib/utils';

export default function KerjaAdminPage() {
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [showDocUploadForm, setShowDocUploadForm] = useState(false);

  const [newPin, setNewPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  const [editingItem, setEditingItem] = useState<{
    id?: number;
    category: string;
    title: string;
    content_html: string;
    content_raw: string;
    order: number;
    is_active: boolean;
  }>({
    category: 'perkenalan',
    title: '',
    content_html: '',
    content_raw: '',
    order: 1,
    is_active: true
  });
  const [isSavingItem, setIsSavingItem] = useState(false);

  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('sertifikat');
  const [docDescription, setDocDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const { data: configData, refetch: refetchConfig } = useQuery({
    queryKey: ['kerja-admin-config'],
    queryFn: async () => {
      const res = await adminApi.get('/kerja/config');
      return res.data;
    }
  });

  const { data: publicData, isLoading, refetch: refetchData } = useQuery({
    queryKey: ['kerja-admin-data'],
    queryFn: async () => {
      const res = await adminApi.get('/kerja/public-data');
      return res.data;
    }
  });

  const currentPin = configData?.find((c: any) => c.key === 'pin')?.value || '280219';
  const items: any[] = publicData?.items || [];
  const documents: any[] = publicData?.documents || [];

  const handleUpdatePin = async () => {
    if (!newPin.trim()) return;
    setIsUpdatingPin(true);
    try {
      await adminApi.post('/kerja/config', { key: 'pin', value: newPin.trim() });
      toast({ title: '✓ PIN Berhasil Diperbarui', description: `PIN baru: ${newPin.trim()}` });
      setNewPin('');
      refetchConfig();
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal memperbarui PIN',
        description: e?.response?.data?.error || e.message
      });
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleOpenEditor = (item?: any) => {
    if (item) {
      setEditingItem({ ...item });
    } else {
      setEditingItem({
        category: 'perkenalan',
        title: '',
        content_html: '',
        content_raw: '',
        order: items.length + 1,
        is_active: true
      });
    }
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.title.trim() || !editingItem.content_html.trim()) {
      toast({ variant: 'destructive', title: 'Judul dan isi HTML wajib diisi' });
      return;
    }

    setIsSavingItem(true);
    try {
      if (editingItem.id) {
        await adminApi.put(`/kerja-items/${editingItem.id}`, editingItem);
        toast({ title: '✓ Materi Berhasil Diperbarui' });
      } else {
        await adminApi.post('/kerja-items', editingItem);
        toast({ title: '✓ Materi Baru Ditambahkan' });
      }
      setViewMode('list');
      refetchData();
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal menyimpan materi',
        description: e?.response?.data?.error || e.message
      });
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Hapus materi ini secara permanen?')) return;
    try {
      await adminApi.delete(`/kerja-items/${id}`);
      toast({ title: '✓ Materi Dihapus' });
      refetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal menghapus materi' });
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !docTitle.trim()) {
      toast({ variant: 'destructive', title: 'Pilih berkas dan isi judul dokumen' });
      return;
    }

    setIsUploadingDoc(true);
    try {
      const base64 = await fileToBase64(selectedFile);
      const uploadRes = await mediaApi.uploadFile(base64, { folder: 'portfolio' });

      await adminApi.post('/kerja-documents', {
        title: docTitle.trim(),
        category: docCategory,
        file_url: uploadRes.secure_url || uploadRes.url,
        file_type: selectedFile.type.includes('pdf') ? 'pdf' : 'image',
        file_size: selectedFile.size,
        description: docDescription.trim(),
        order: documents.length + 1
      });

      toast({ title: '✓ Dokumen Berhasil Diunggah' });
      setShowDocUploadForm(false);
      setDocTitle('');
      setDocDescription('');
      setSelectedFile(null);
      refetchData();
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal mengunggah dokumen',
        description: e?.response?.data?.error || e.message
      });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!window.confirm('Hapus dokumen ini dari Vault?')) return;
    try {
      await adminApi.delete(`/kerja-documents/${id}`);
      toast({ title: '✓ Dokumen Dihapus' });
      refetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal menghapus dokumen' });
    }
  };

  const handleInsertHtmlTag = (tagType: 'badge-sky' | 'badge-emerald' | 'highlight' | 'card') => {
    let snippet = '';
    if (tagType === 'badge-sky') {
      snippet = '<span class="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">Teks Badge</span>';
    } else if (tagType === 'badge-emerald') {
      snippet = '<span class="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Teks Badge</span>';
    } else if (tagType === 'highlight') {
      snippet = '<strong class="text-sky-400 font-semibold">Teks Tebal Berwarna</strong>';
    } else if (tagType === 'card') {
      snippet = `
<div class="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 backdrop-blur-sm space-y-2">
  <div class="flex items-center gap-2">
    <span class="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">Judul Blok</span>
  </div>
  <p class="text-base text-white">Isi penjelasan wawancara Anda di sini.</p>
</div>`.trim();
    }

    setEditingItem(prev => ({
      ...prev,
      content_html: prev.content_html ? `${prev.content_html}\n\n${snippet}` : snippet
    }));
  };

  if (viewMode === 'editor') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 text-xs gap-1.5 rounded-lg active:scale-[0.98]"
            >
              <ArrowLeft className="size-3.5" />
              <span>Kembali</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {editingItem.id ? 'Edit Materi Wawancara' : 'Tambah Materi Wawancara Baru'}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mode Editor Inline dengan Live Preview Visual Berwarna
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 text-xs px-3 rounded-lg active:scale-[0.98]"
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveItem}
              disabled={isSavingItem}
              size="sm"
              className="h-8 text-xs gap-1.5 px-3.5 rounded-lg active:scale-[0.98]"
            >
              {isSavingItem ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              <span>{isSavingItem ? 'Menyimpan...' : 'Simpan Materi'}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl border border-border/60 bg-card/80 space-y-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Kategori</Label>
                  <Input
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="h-8 text-xs rounded-lg font-mono"
                    placeholder="perkenalan / tips / qa"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Urutan Tampil</Label>
                  <Input
                    type="number"
                    value={editingItem.order}
                    onChange={e => setEditingItem({ ...editingItem, order: Number(e.target.value) || 0 })}
                    className="h-8 text-xs rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Judul Materi</Label>
                <Input
                  value={editingItem.title}
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="h-8 text-xs rounded-lg font-medium"
                  placeholder="Contoh: Elevator Pitch: Perkenalan Diri Wawancara Kerja"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">HTML Berwarna (Rich Visual View)</Label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleInsertHtmlTag('badge-sky')}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-colors font-mono"
                    >
                      +Badge Biru
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertHtmlTag('badge-emerald')}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors font-mono"
                    >
                      +Badge Hijau
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertHtmlTag('highlight')}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-colors font-mono"
                    >
                      +Highlight
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertHtmlTag('card')}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors font-mono"
                    >
                      +Blok Card
                    </button>
                  </div>
                </div>
                <Textarea
                  rows={14}
                  value={editingItem.content_html}
                  onChange={e => setEditingItem({ ...editingItem, content_html: e.target.value })}
                  className="text-xs font-mono rounded-xl bg-muted/25 leading-relaxed p-3 focus-visible:ring-sky-500"
                  placeholder="Masukkan kode HTML berwarna di sini..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Teks Raw (Naskah Mentah untuk Disalin Cepat)</Label>
                <Textarea
                  rows={5}
                  value={editingItem.content_raw}
                  onChange={e => setEditingItem({ ...editingItem, content_raw: e.target.value })}
                  className="text-xs rounded-xl bg-muted/25 leading-relaxed p-3"
                  placeholder="Naskah polos tanpa format HTML..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 text-xs rounded-lg active:scale-[0.98]"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSaveItem}
                  disabled={isSavingItem}
                  size="sm"
                  className="h-8 text-xs gap-1.5 rounded-lg active:scale-[0.98]"
                >
                  {isSavingItem ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  <span>{isSavingItem ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl border border-border/60 bg-card/80 sticky top-20 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-sky-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Live Real-time Preview
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {editingItem.category || 'Materi'}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-white">
                  {editingItem.title || 'Judul Materi Belum Diisi'}
                </h4>
              </div>

              <div className="rounded-xl border border-border/50 bg-[#07090e] p-4 max-h-[60vh] overflow-y-auto">
                {editingItem.content_html ? (
                  <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: editingItem.content_html }}
                  />
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    Ketik atau modifikasi isi HTML di sebelah kiri untuk melihat tampilan langsung di sini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Vault Kerja & Wawancara</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola kode akses PIN, naskah wawancara (HTML visual berwarna), dan lemari dokumen rahasia.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-8 text-xs gap-1.5 rounded-lg active:scale-[0.98]"
          >
            <a href="/kerja" target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" />
              <span>Buka Halaman /kerja</span>
            </a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetchData()}
            className="h-8 size-8 p-0 rounded-lg shrink-0"
            title="Muat ulang data"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-border/60 bg-card/70 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="size-4 text-sky-500" />
          <h2 className="font-semibold text-sm">Keamanan & Kode PIN Akses</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs">PIN Saat Ini (Database Production)</Label>
            <div className="flex items-center gap-2">
              <div className="h-8 px-3 rounded-lg bg-muted/60 border border-border/60 font-mono text-sm flex items-center gap-2 flex-1">
                <span>{showPin ? currentPin : '••••••'}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPin(p => !p)}
                className="size-8 rounded-lg"
              >
                {showPin ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Ganti Kode PIN Baru</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Masukkan PIN baru"
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                className="h-8 text-xs font-mono rounded-lg flex-1"
                maxLength={12}
              />
              <Button
                size="sm"
                onClick={handleUpdatePin}
                disabled={isUpdatingPin || !newPin.trim()}
                className="h-8 text-xs gap-1.5 rounded-lg active:scale-[0.98] shrink-0"
              >
                {isUpdatingPin ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Simpan PIN
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="font-semibold text-sm">Materi & Naskah Wawancara (HTML Visual Berwarna)</h2>
          </div>
          <Button
            size="sm"
            onClick={() => handleOpenEditor()}
            className="h-8 text-xs gap-1.5 rounded-lg active:scale-[0.98]"
          >
            <Plus className="size-3.5" /> Tambah Materi Baru
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-border/50 bg-card hover:border-border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-sky-500/15 text-sky-400 font-mono">
                    {item.category}
                  </span>
                  <h3 className="font-semibold text-sm truncate text-white">{item.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {item.content_raw}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEditor(item)}
                  className="h-7 text-xs gap-1 rounded-md active:scale-[0.98]"
                >
                  <Edit3 className="size-3" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteItem(item.id)}
                  className="h-7 text-xs text-destructive hover:bg-destructive/10 rounded-md"
                >
                  <Trash2 className="size-3" /> Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-rose-400" />
            <h2 className="font-semibold text-sm">Lemari Dokumen & Sertifikat Rahasia ({documents.length})</h2>
          </div>
          <Button
            size="sm"
            onClick={() => setShowDocUploadForm(p => !p)}
            variant={showDocUploadForm ? 'secondary' : 'default'}
            className="h-8 text-xs gap-1.5 rounded-lg active:scale-[0.98]"
          >
            {showDocUploadForm ? <Layers className="size-3.5" /> : <Upload className="size-3.5" />}
            <span>{showDocUploadForm ? 'Tutup Panel Unggah' : 'Unggah Dokumen Baru'}</span>
          </Button>
        </div>

        {showDocUploadForm && (
          <div className="p-5 rounded-2xl border border-border/70 bg-muted/20 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="font-bold text-sm text-white">Panel Unggah Berkas Rahasia</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDocUploadForm(false)}
                className="h-7 text-xs rounded-md"
              >
                Batal
              </Button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Judul Dokumen</Label>
                  <Input
                    value={docTitle}
                    onChange={e => setDocTitle(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                    placeholder="Contoh: Sertifikat Magang PT Pertamina Hulu Rokan"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Kategori Berkas</Label>
                  <Input
                    value={docCategory}
                    onChange={e => setDocCategory(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                    placeholder="sertifikat / ijazah / transkrip"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Pilih File (PDF / PNG / JPG)</Label>
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={e => {
                    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                  }}
                  className="h-9 text-xs rounded-lg file:mr-2 file:h-6 file:rounded-md file:border-0 file:bg-primary/20 file:text-primary file:text-xs cursor-pointer"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Deskripsi Ringkas (Opsional)</Label>
                <Textarea
                  rows={2}
                  value={docDescription}
                  onChange={e => setDocDescription(e.target.value)}
                  className="text-xs rounded-lg"
                  placeholder="Keterangan singkat tentang berkas..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDocUploadForm(false)}
                  className="h-8 text-xs rounded-lg"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isUploadingDoc || !selectedFile || !docTitle.trim()}
                  size="sm"
                  className="h-8 text-xs rounded-lg gap-1.5 active:scale-[0.98]"
                >
                  {isUploadingDoc ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  <span>{isUploadingDoc ? 'Mengunggah...' : 'Unggah Sekarang'}</span>
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-border/50 bg-card flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-muted text-muted-foreground font-mono">
                    {doc.file_type}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {formatBytes(doc.file_size)}
                  </span>
                </div>
                <h3 className="font-semibold text-xs text-white line-clamp-2">{doc.title}</h3>
                <p className="text-[11px] font-mono text-primary/80 truncate">{doc.file_url}</p>
              </div>

              <div className="flex items-center justify-between gap-1 pt-2 border-t border-border/40">
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-7 text-xs px-2.5 rounded-md"
                >
                  <a href={doc.file_url} target="_blank" rel="noreferrer">
                    Buka Berkas
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="h-7 text-xs text-destructive hover:bg-destructive/10 rounded-md"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
