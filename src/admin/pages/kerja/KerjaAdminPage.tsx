import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck, Key, FileText, Trash2, Edit3,
  RefreshCw, Upload, Eye, EyeOff, Save, Loader2, ArrowLeft,
  Sparkles, MessageSquare, Zap
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
  const [editorInputMode, setEditorInputMode] = useState<'html' | 'simple'>('html');
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

  const handleOpenEditor = (item: any) => {
    setEditingItem({ ...item });
    setEditorInputMode('html');
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      content_html: editingItem.content_html
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

  const perkenalanItem = items.find(i => i.category === 'perkenalan');
  const tipsItem = items.find(i => i.category === 'tips');
  const qaItem = items.find(i => i.category === 'qa');

  if (viewMode === 'editor') {
    return (
      <div className="space-y-4 max-w-7xl mx-auto p-4 sm:p-6">
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
              <h1 className="text-base font-bold tracking-tight text-foreground">
                Edit Master HTML View: {editingItem.title}
              </h1>
              <p className="text-xs text-muted-foreground">
                Kategori: <strong className="font-mono text-sky-400">{editingItem.category}</strong> (1 File Terpadu)
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
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-xl border border-border/60 bg-card/80 space-y-3 shadow-sm">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Judul Dokumen</Label>
                <Input
                  value={editingItem.title}
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="h-8 text-xs rounded-lg font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Kode HTML View</Label>
                  <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/40">
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
                    <button
                      type="button"
                      onClick={() => setEditorInputMode('simple')}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-medium transition-all',
                        editorInputMode === 'simple' ? 'bg-sky-500/20 text-sky-400 font-semibold' : 'text-muted-foreground'
                      )}
                    >
                      Teks Ringkas
                    </button>
                  </div>
                </div>

                {editorInputMode === 'html' ? (
                  <Textarea
                    value={editingItem.content_html}
                    onChange={e => setEditingItem({ ...editingItem, content_html: e.target.value })}
                    rows={22}
                    className="font-mono text-[11px] leading-relaxed rounded-lg bg-[#07090e] border-border/60 text-slate-200"
                    placeholder="<div class=...>"
                    required
                  />
                ) : (
                  <Textarea
                    value={editingItem.content_raw}
                    onChange={e => setEditingItem({ ...editingItem, content_raw: e.target.value })}
                    rows={22}
                    className="text-xs leading-relaxed rounded-lg"
                    placeholder="Tuliskan teks ringkas..."
                  />
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-xl border border-border/60 bg-card/80 space-y-3 shadow-sm sticky top-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <h3 className="text-xs font-semibold text-foreground">
                  Pratinjau Langsung (Mobile Responsive)
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-sky-500/15 text-sky-400">
                  {editingItem.category}
                </span>
              </div>

              <div className="rounded-lg border border-border/50 bg-[#07090e] p-2 max-h-[75vh] overflow-y-auto">
                <div
                  className="w-full text-xs"
                  dangerouslySetInnerHTML={{
                    __html: editingItem.content_html || '<p class="text-muted-foreground italic p-4 text-center">Belum ada konten...</p>'
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
    <div className="space-y-5 max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-sky-400" />
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              Manajemen Vault Kerja (1 Master View Per Kategori)
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Setiap kategori berupa 1 naskah HTML terpadu lengkap tanpa pembuatan item berulang.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchData()}
          className="h-7 text-xs px-2.5 rounded-md self-start sm:self-auto"
        >
          <RefreshCw className={cn('size-3 mr-1', isLoading && 'animate-spin')} />
          <span>Segarkan</span>
        </Button>
      </div>

      <div className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/25 flex items-center justify-center shrink-0">
            <Key className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Kode PIN Akses Halaman /kerja</h3>
            <p className="text-[11px] text-muted-foreground">
              PIN saat ini: <strong className="font-mono text-foreground">{showPin ? currentPin : '••••••'}</strong>
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
            <span>{showPin ? 'Tutup' : 'Lihat'}</span>
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
            {isUpdatingPin ? '...' : 'Ubah'}
          </Button>
        </div>
      </div>

      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
          3 Master HTML Views Utama
        </h2>

        <div className="grid grid-cols-1 gap-2.5">
          <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-card/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/25 flex items-center justify-center shrink-0">
                <Sparkles className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-sky-500/15 text-sky-400 font-semibold">
                    perkenalan
                  </span>
                  <h3 className="font-semibold text-xs text-foreground truncate">
                    {perkenalanItem?.title || 'Perkenalan Diri Wawancara Kerja'}
                  </h3>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  1 naskah lengkap: profil hero, data singkat, script 01-07, istilah teknis, dan checklist.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => perkenalanItem && handleOpenEditor(perkenalanItem)}
              disabled={!perkenalanItem}
              className="h-7 text-xs px-3 rounded-lg active:scale-[0.98] gap-1 shrink-0 self-end sm:self-center"
            >
              <Edit3 className="size-3 text-sky-400" />
              <span>Edit HTML View</span>
            </Button>
          </div>

          <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-card/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Zap className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-amber-500/15 text-amber-400 font-semibold">
                    tips
                  </span>
                  <h3 className="font-semibold text-xs text-foreground truncate">
                    {tipsItem?.title || 'Panduan & Tips Wawancara HRD'}
                  </h3>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  1 naskah terpadu: tempo bicara, bahasa tubuh, metode STAR, dan etika penutupan.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => tipsItem && handleOpenEditor(tipsItem)}
              disabled={!tipsItem}
              className="h-7 text-xs px-3 rounded-lg active:scale-[0.98] gap-1 shrink-0 self-end sm:self-center"
            >
              <Edit3 className="size-3 text-amber-400" />
              <span>Edit HTML View</span>
            </Button>
          </div>

          <div className="p-3 sm:p-4 rounded-xl border border-border/50 bg-card/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <MessageSquare className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-emerald-500/15 text-emerald-400 font-semibold">
                    qa
                  </span>
                  <h3 className="font-semibold text-xs text-foreground truncate">
                    {qaItem?.title || 'Bank Tanya-Jawab Wawancara'}
                  </h3>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  1 naskah terpadu: simulasi 8 pertanyaan inti dan jawaban kunci interview.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => qaItem && handleOpenEditor(qaItem)}
              disabled={!qaItem}
              className="h-7 text-xs px-3 rounded-lg active:scale-[0.98] gap-1 shrink-0 self-end sm:self-center"
            >
              <Edit3 className="size-3 text-emerald-400" />
              <span>Edit HTML View</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Dokumen & Berkas Pendukung ({documents.length})
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Berkas PDF dan gambar pendukung tersimpan di GitHub CDN.
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
          <form onSubmit={handleUploadDocument} className="p-3.5 rounded-xl border border-border/60 bg-card/60 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Judul Dokumen</Label>
                <Input
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  placeholder="Contoh: Ijazah & Transkrip Nilai"
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
                placeholder="Keterangan singkat berkas..."
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-xl border border-border/50 bg-card/60 flex items-center justify-between gap-2"
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
