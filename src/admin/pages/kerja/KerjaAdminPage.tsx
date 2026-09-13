import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck, Key, FileText, Plus, Trash2, Edit3,
  RefreshCw, Upload,
  Eye, EyeOff, Save, Loader2, ArrowLeft,
  Sparkles, MessageSquare, Zap, Layers, CheckCircle2
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
  const [editorInputMode, setEditorInputMode] = useState<'simple' | 'html'>('simple');
  const [filterCategory, setFilterCategory] = useState<string>('all');
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
      toast({ title: 'PIN Berhasil Diperbarui', description: `PIN baru: ${newPin.trim()}` });
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
      const hasCustomHtml = item.content_html && !item.content_html.includes('<p class="text-base text-white">') && item.content_html.includes('<');
      setEditorInputMode(hasCustomHtml ? 'html' : 'simple');
    } else {
      setEditingItem({
        category: 'perkenalan',
        title: '',
        content_html: '',
        content_raw: '',
        order: items.length + 1,
        is_active: true
      });
      setEditorInputMode('simple');
    }
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimpleTextChange = (text: string) => {
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const generatedHtml = paragraphs.map(p => {
      return `<div class="p-3.5 rounded-xl border border-border/50 bg-card/60 leading-relaxed text-sm text-slate-200"><p class="text-white">${p.replace(/\n/g, '<br/>')}</p></div>`;
    }).join('\n\n');

    setEditingItem(prev => ({
      ...prev,
      content_raw: text,
      content_html: generatedHtml || text
    }));
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.title.trim()) {
      toast({ variant: 'destructive', title: 'Judul materi wajib diisi' });
      return;
    }

    const payload = {
      ...editingItem,
      content_raw: editingItem.content_raw || editingItem.content_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      content_html: editingItem.content_html || editingItem.content_raw
    };

    if (!payload.content_html.trim()) {
      toast({ variant: 'destructive', title: 'Isi materi tidak boleh kosong' });
      return;
    }

    setIsSavingItem(true);
    try {
      if (editingItem.id) {
        await adminApi.put(`/kerja-items/${editingItem.id}`, payload);
        toast({ title: 'Materi Berhasil Diperbarui' });
      } else {
        await adminApi.post('/kerja-items', payload);
        toast({ title: 'Materi Baru Ditambahkan' });
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
      toast({ title: 'Materi Dihapus' });
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

      toast({ title: 'Dokumen Berhasil Diunggah' });
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
      toast({ title: 'Dokumen Dihapus' });
      refetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal menghapus dokumen' });
    }
  };

  const filteredItems = items.filter(item => {
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  if (viewMode === 'editor') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
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
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                {editingItem.id ? 'Edit Materi Wawancara' : 'Tambah Materi Baru'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Editor satu form naskah lengkap dengan pratinjau langsung.
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
                  <select
                    value={['perkenalan', 'tips', 'qa'].includes(editingItem.category) ? editingItem.category : 'custom'}
                    onChange={e => {
                      if (e.target.value !== 'custom') {
                        setEditingItem({ ...editingItem, category: e.target.value });
                      }
                    }}
                    className="w-full h-8 text-xs rounded-lg font-mono bg-muted/40 border border-input px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="perkenalan">perkenalan (Perkenalan Diri)</option>
                    <option value="tips">tips (Panduan HRD)</option>
                    <option value="qa">qa (Tanya-Jawab Q&A)</option>
                    <option value="custom">Kustom...</option>
                  </select>
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
                  placeholder="Contoh: Perkenalan Diri Wawancara Kerja"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">
                    {editorInputMode === 'simple' ? 'Naskah Percakapan (Satu Form Lengkap)' : 'Kode HTML Kustom'}
                  </Label>
                  <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/40">
                    <button
                      type="button"
                      onClick={() => setEditorInputMode('simple')}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-medium transition-all',
                        editorInputMode === 'simple' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-muted-foreground'
                      )}
                    >
                      Teks Alami
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorInputMode('html')}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-medium transition-all',
                        editorInputMode === 'html' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-muted-foreground'
                      )}
                    >
                      Mode HTML
                    </button>
                  </div>
                </div>

                {editorInputMode === 'simple' ? (
                  <Textarea
                    rows={15}
                    value={editingItem.content_raw}
                    onChange={e => handleSimpleTextChange(e.target.value)}
                    className="text-xs rounded-xl bg-muted/25 leading-relaxed p-3 focus-visible:ring-sky-500"
                    placeholder="Tulis naskah percakapan lengkap Anda di sini..."
                    required
                  />
                ) : (
                  <Textarea
                    rows={15}
                    value={editingItem.content_html}
                    onChange={e => setEditingItem({ ...editingItem, content_html: e.target.value })}
                    className="text-xs font-mono rounded-xl bg-muted/25 leading-relaxed p-3 focus-visible:ring-sky-500"
                    placeholder="Masukkan tag HTML di sini..."
                    required
                  />
                )}
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
                  <span>{isSavingItem ? 'Menyimpan...' : 'Simpan Materi'}</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl border border-border/60 bg-card/80 sticky top-20 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-1.5">
                  <Eye className="size-3.5 text-sky-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Pratinjau Langsung
                  </h3>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400">
                  {editingItem.category}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  {editingItem.title || 'Judul Materi'}
                </h4>
              </div>

              <div className="rounded-xl border border-border/50 bg-[#07090e] p-4 max-h-[60vh] overflow-y-auto">
                <div
                  className="text-xs"
                  dangerouslySetInnerHTML={{
                    __html: editingItem.content_html || '<p class="text-muted-foreground italic">Mulai mengetik naskah untuk melihat pratinjau...</p>'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-sky-400" />
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Manajemen Vault Kerja & Wawancara
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola naskah latihan perkenalan, tips wawancara, dan berkas penting portofolio.
          </p>
        </div>

        <Button
          onClick={() => handleOpenEditor()}
          size="sm"
          className="h-8 text-xs gap-1.5 rounded-lg active:scale-[0.98] font-semibold shrink-0"
        >
          <Plus className="size-3.5" />
          <span>Tambah Materi Baru</span>
        </Button>
      </div>

      <div className="p-4 rounded-xl border border-border/60 bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/25 flex items-center justify-center shrink-0">
            <Key className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Kode PIN Rahasia Akses /kerja</h3>
            <p className="text-[11px] text-muted-foreground">
              PIN aktif saat ini: <strong className="font-mono text-foreground">{showPin ? currentPin : '••••••'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPin(p => !p)}
            className="h-7 text-xs px-2 rounded-md"
          >
            {showPin ? <EyeOff className="size-3.5 mr-1" /> : <Eye className="size-3.5 mr-1" />}
            <span>{showPin ? 'Sembunyikan' : 'Lihat'}</span>
          </Button>

          <Input
            type="text"
            inputMode="numeric"
            maxLength={12}
            placeholder="PIN Baru"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            className="w-24 h-7 text-xs font-mono text-center rounded-md"
          />

          <Button
            onClick={handleUpdatePin}
            disabled={isUpdatingPin || !newPin.trim()}
            size="sm"
            className="h-7 text-xs px-2.5 rounded-md active:scale-[0.98]"
          >
            {isUpdatingPin ? 'Menyimpan...' : 'Ubah'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/40">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={cn(
                'h-6 px-2.5 rounded text-xs font-medium transition-all',
                filterCategory === 'all' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground'
              )}
            >
              Semua ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('perkenalan')}
              className={cn(
                'h-6 px-2.5 rounded text-xs font-medium transition-all',
                filterCategory === 'perkenalan' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground'
              )}
            >
              Perkenalan ({items.filter(i => i.category === 'perkenalan').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('tips')}
              className={cn(
                'h-6 px-2.5 rounded text-xs font-medium transition-all',
                filterCategory === 'tips' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground'
              )}
            >
              Tips HRD ({items.filter(i => i.category === 'tips').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('qa')}
              className={cn(
                'h-6 px-2.5 rounded text-xs font-medium transition-all',
                filterCategory === 'qa' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground'
              )}
            >
              Tanya-Jawab ({items.filter(i => i.category === 'qa').length})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchData()}
            className="h-7 text-xs px-2.5 rounded-md"
          >
            <RefreshCw className={cn('size-3 mr-1', isLoading && 'animate-spin')} />
            <span>Segarkan</span>
          </Button>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Memuat data materi...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/50 rounded-xl">
              Belum ada materi wawancara dalam kategori ini.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-3 sm:p-4 rounded-xl border border-border/50 bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-border"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-muted text-muted-foreground">
                      {item.category}
                    </span>
                    <h3 className="font-semibold text-xs text-foreground truncate">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {item.content_raw || item.content_html.replace(/<[^>]+>/g, ' ')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEditor(item)}
                    className="h-7 text-xs px-2.5 rounded-md active:scale-[0.98] gap-1"
                  >
                    <Edit3 className="size-3" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteItem(item.id)}
                    className="h-7 text-xs px-2 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Dokumen & Sertifikat Pendukung ({documents.length})
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Berkas PDF dan gambar tersimpan di GitHub CDN.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDocUploadForm(p => !p)}
            className="h-7 text-xs gap-1 rounded-md"
          >
            <Upload className="size-3" />
            <span>{showDocUploadForm ? 'Tutup Form' : 'Unggah Berkas'}</span>
          </Button>
        </div>

        {showDocUploadForm && (
          <form onSubmit={handleUploadDocument} className="p-4 rounded-xl border border-border/60 bg-card/60 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Judul Dokumen</Label>
                <Input
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="Contoh: Sertifikat Akreditasi BAN-PT"
                  className="h-7 text-xs rounded-md"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pilih Berkas (PDF / PNG / JPG)</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="h-7 text-xs rounded-md"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Keterangan Singkat</Label>
              <Input
                value={docDescription}
                onChange={e => setDocDescription(e.target.value)}
                placeholder="Penjelasan ringkas dokumen..."
                className="h-7 text-xs rounded-md"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDocUploadForm(false)}
                className="h-7 text-xs rounded-md"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isUploadingDoc || !selectedFile}
                size="sm"
                className="h-7 text-xs rounded-md"
              >
                {isUploadingDoc ? 'Mengunggah...' : 'Unggah ke GitHub'}
              </Button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-xl border border-border/50 bg-card/60 flex items-center justify-between gap-2"
            >
              <div className="min-w-0 space-y-0.5">
                <h4 className="text-xs font-semibold text-foreground truncate" title={doc.title}>
                  {doc.title}
                </h4>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {doc.file_type.toUpperCase()} · {formatBytes(doc.file_size)}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="h-6 text-[11px] px-2 rounded"
                >
                  <a href={doc.file_url} target="_blank" rel="noreferrer">
                    Buka
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="size-6 rounded text-destructive hover:text-destructive"
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
