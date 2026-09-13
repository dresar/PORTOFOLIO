import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck, Key, Lock, FileText, Plus, Trash2, Edit3,
  ExternalLink, Check, Copy, RefreshCw, Upload, AlertCircle,
  Eye, EyeOff, Save, Loader2, X, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useModalStore } from '@/store/modalStore';
import { mediaApi, fileToBase64, formatBytes } from '../../services/mediaApi';
import { adminApi } from '../../services/api';
import { cn } from '@/lib/utils';

export default function KerjaAdminPage() {
  const { toast } = useToast();
  const { openPdfPreviewModal } = useModalStore();
  const qc = useQueryClient();

  const [newPin, setNewPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('sertifikat');
  const [docDescription, setDocDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

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

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.content_html) return;

    try {
      if (editingItem.id) {
        await adminApi.put(`/kerja-items/${editingItem.id}`, editingItem);
        toast({ title: '✓ Materi Diperbarui' });
      } else {
        await adminApi.post('/kerja-items', editingItem);
        toast({ title: '✓ Materi Ditambahkan' });
      }
      setIsItemModalOpen(false);
      setEditingItem(null);
      refetchData();
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal menyimpan',
        description: e?.response?.data?.error || e.message
      });
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Hapus materi ini?')) return;
    try {
      await adminApi.delete(`/kerja-items/${id}`);
      toast({ title: '✓ Materi Dihapus' });
      refetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Gagal menghapus' });
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
      setIsDocModalOpen(false);
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
            Kelola kode akses PIN, materi wawancara (HTML berwarna), dan lemari dokumen rahasia.
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
            <h2 className="font-semibold text-sm">Materi & Teks Wawancara (HTML Berwarna)</h2>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingItem({
                category: 'perkenalan',
                title: '',
                content_html: '',
                content_raw: '',
                order: items.length + 1,
                is_active: true
              });
              setIsItemModalOpen(true);
            }}
            className="h-8 text-xs gap-1.5 rounded-lg active:scale-[0.98]"
          >
            <Plus className="size-3.5" /> Tambah Materi
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-border/50 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-sky-500/15 text-sky-400">
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
                  onClick={() => {
                    setEditingItem(item);
                    setIsItemModalOpen(true);
                  }}
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
            <h2 className="font-semibold text-sm">Lemari Dokumen & Sertifikat ({documents.length})</h2>
          </div>
          <Button
            size="sm"
            onClick={() => setIsDocModalOpen(true)}
            className="h-8 text-xs gap-1.5 rounded-lg active:scale-[0.98]"
          >
            <Upload className="size-3.5" /> Unggah Dokumen
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-border/50 bg-card flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-muted text-muted-foreground">
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
                  onClick={() => {
                    if (doc.file_type === 'pdf') {
                      openPdfPreviewModal(doc.file_url, doc.title);
                    } else {
                      window.open(doc.file_url, '_blank');
                    }
                  }}
                  className="h-7 text-xs px-2.5 rounded-md"
                >
                  Lihat
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

      {isItemModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-card border border-border/60 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editingItem.id ? 'Edit Materi Wawancara' : 'Tambah Materi Wawancara'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsItemModalOpen(false)}
                className="size-7 rounded-md"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Kategori</Label>
                  <Input
                    value={editingItem.category}
                    onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="h-8 text-xs rounded-lg"
                    placeholder="perkenalan / tips / qa"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Judul</Label>
                  <Input
                    value={editingItem.title}
                    onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="h-8 text-xs rounded-lg"
                    placeholder="Judul materi"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">HTML Berwarna (Rich Visual View)</Label>
                <Textarea
                  rows={8}
                  value={editingItem.content_html}
                  onChange={e => setEditingItem({ ...editingItem, content_html: e.target.value })}
                  className="text-xs font-mono rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Teks Raw (Untuk Disalin)</Label>
                <Textarea
                  rows={4}
                  value={editingItem.content_raw}
                  onChange={e => setEditingItem({ ...editingItem, content_raw: e.target.value })}
                  className="text-xs rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsItemModalOpen(false)}
                  className="h-8 text-xs rounded-lg"
                >
                  Batal
                </Button>
                <Button type="submit" className="h-8 text-xs rounded-lg">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-card border border-border/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-sm text-white">Unggah Dokumen / Sertifikat Rahasia</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDocModalOpen(false)}
                className="size-7 rounded-md"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Judul Dokumen</Label>
                <Input
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  className="h-8 text-xs rounded-lg"
                  placeholder="Contoh: Sertifikat Magang Pertamina"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Kategori</Label>
                <Input
                  value={docCategory}
                  onChange={e => setDocCategory(e.target.value)}
                  className="h-8 text-xs rounded-lg"
                  placeholder="sertifikat / ijazah / transkrip"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Pilih Berkas (PDF / PNG / JPG)</Label>
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={e => {
                    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                  }}
                  className="h-9 text-xs rounded-lg file:mr-2 file:h-6 file:rounded-md file:border-0 file:bg-primary/20 file:text-primary file:text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Deskripsi (Opsional)</Label>
                <Textarea
                  rows={2}
                  value={docDescription}
                  onChange={e => setDocDescription(e.target.value)}
                  className="text-xs rounded-lg"
                  placeholder="Keterangan singkat berkas..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDocModalOpen(false)}
                  className="h-8 text-xs rounded-lg"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isUploadingDoc || !selectedFile || !docTitle.trim()}
                  className="h-8 text-xs rounded-lg gap-1.5"
                >
                  {isUploadingDoc ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  {isUploadingDoc ? 'Mengunggah...' : 'Unggah'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
