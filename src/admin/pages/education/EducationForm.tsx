import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { useQueryClient } from '@tanstack/react-query';
import { RichHtmlEditor } from '@/admin/components/RichHtmlEditor';

export default function EducationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    gpa: '',
    logo: '',
    coverImage: '',
    location: '',
    mapUrl: '',
    description: '',
    gallery: '[]'
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadEducation(Number(id));
    } else if (id === 'new') {
      api.education.getAll().then((list: any[]) => {
        const nextId = list && list.length > 0 ? Math.max(...list.map((e: any) => Number(e.id) || 0)) + 1 : 1;
        setFormData(prev => ({ ...prev, id: nextId }));
      }).catch(() => {});
    }
  }, [id]);

  const loadEducation = async (eduId: number) => {
    setIsLoading(true);
    try {
      const data = await api.education.getAll();
      const edu = data.find((e: any) => e.id === eduId);
      if (edu) {
        setFormData({
            id: Number(edu.id),
            institution: edu.institution,
            degree: edu.degree || '',
            field: edu.field || '',
            startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
            endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : '',
            gpa: edu.gpa || '',
            logo: edu.logo || '',
            coverImage: edu.coverImage || '',
            location: edu.location || '',
            mapUrl: edu.mapUrl || '',
            description: edu.description || '',
            gallery: typeof edu.gallery === 'string' ? edu.gallery : JSON.stringify(edu.gallery || [])
        });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal!", description: "Gagal memuat data." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!formData.institution) throw new Error("Institusi wajib diisi");
      if (!formData.startDate) throw new Error("Tanggal mulai wajib diisi");

      const payload: any = {
        ...formData,
        logo_url: formData.logo,
        cover_image: formData.coverImage,
        endDate: formData.endDate || null,
      };

      if (id && id !== 'new') {
        const numericId = Number(id);
        if (formData.id !== undefined && !isNaN(Number(formData.id)) && Number(formData.id) !== numericId) {
          payload.id = Number(formData.id);
        }
        await api.education.update(numericId, payload);
        toast({ title: "✓ Tersimpan!", description: "Data pendidikan diperbarui." });
      } else {
        if (formData.id !== undefined && !isNaN(Number(formData.id))) {
          payload.id = Number(formData.id);
        }
        await api.education.create(payload);
        toast({ title: "✓ Tersimpan!", description: "Data pendidikan ditambahkan." });
      }
      await queryClient.invalidateQueries({ queryKey: ['education'] });
      navigate('/admin/education');
    } catch (error: any) {
      const errDetail = error?.response?.data?.detail || error?.response?.data?.error || error?.message || String(error || '');
      if (errDetail.includes('duplicate key') || errDetail.includes('already exists') || errDetail.includes('education_pkey')) {
        toast({
          variant: "destructive",
          title: "Gagal!",
          description: `ID ${formData.id} sudah digunakan.`
        });
      } else {
        toast({ variant: "destructive", title: "Gagal!", description: error.message || "Gagal menyimpan data." });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGalleryImage = () => {
    const url = prompt("URL Gambar:");
    if (url) {
      if (!url.startsWith('http')) {
        toast({ variant: "destructive", title: "Gagal!", description: "URL tidak valid." });
        return;
      }
      const current = JSON.parse(formData.gallery || '[]');
      const updated = [...current, url];
      setFormData({...formData, gallery: JSON.stringify(updated)});
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const current = JSON.parse(formData.gallery || '[]');
    const updated = current.filter((_: any, i: number) => i !== index);
    setFormData({...formData, gallery: JSON.stringify(updated)});
  };

  if (isLoading) return <div className="flex justify-center p-12"><ModernLoader size="lg" text="Memuat..." /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/education')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{id === 'new' ? 'Tambah Pendidikan' : 'Edit Pendidikan'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1 space-y-2">
                    <Label>ID</Label>
                    <Input 
                      type="number"
                      value={formData.id !== undefined ? formData.id : ''} 
                      onChange={(e) => setFormData({...formData, id: e.target.value ? Number(e.target.value) : undefined})} 
                      placeholder="ID"
                      required 
                      className="font-mono"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <Label>Institusi</Label>
                    <Input 
                      value={formData.institution} 
                      onChange={(e) => setFormData({...formData, institution: e.target.value})} 
                      placeholder="Institusi"
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gelar</Label>
                    <Input 
                      value={formData.degree} 
                      onChange={(e) => setFormData({...formData, degree: e.target.value})} 
                      placeholder="Gelar"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Jurusan</Label>
                    <Input 
                      value={formData.field} 
                      onChange={(e) => setFormData({...formData, field: e.target.value})} 
                      placeholder="Jurusan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Mulai</Label>
                    <Input 
                      type="date"
                      value={formData.startDate} 
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Selesai</Label>
                    <Input 
                      type="date"
                      value={formData.endDate} 
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                    />
                    <p className="text-xs text-muted-foreground">Kosongkan jika masih studi.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lokasi</Label>
                    <Input 
                      value={formData.location} 
                      onChange={(e) => setFormData({...formData, location: e.target.value})} 
                      placeholder="Lokasi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nilai</Label>
                    <Input 
                      value={formData.gpa} 
                      onChange={(e) => setFormData({...formData, gpa: e.target.value})} 
                      placeholder="Nilai"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Google Maps</Label>
                  <Input 
                    value={formData.mapUrl} 
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.includes('<iframe') && val.includes('src="')) {
                        const match = val.match(/src="([^"]+)"/);
                        if (match && match[1]) {
                          val = match[1];
                        }
                      }
                      setFormData({...formData, mapUrl: val});
                    }} 
                    placeholder="URL"
                  />
                  {formData.mapUrl && (
                    <div className="aspect-video w-full rounded-md overflow-hidden border mt-2 bg-muted">
                      <iframe 
                        key={formData.mapUrl}
                        src={formData.mapUrl} 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy"
                        title="Map"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Deskripsi</Label>
                  <RichHtmlEditor 
                    value={formData.description} 
                    onChange={(val) => setFormData({...formData, description: val})} 
                    placeholder="Deskripsi"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Galeri</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={handleAddGalleryImage}>
                  <Plus className="h-4 w-4 mr-2" /> Tambah
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {JSON.parse(formData.gallery || '[]').map((url: string, idx: number) => (
                    <div key={idx} className="relative aspect-video group bg-muted rounded-lg overflow-hidden border">
                      <img src={url} className="w-full h-full object-cover" alt={`Galeri ${idx}`} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveGalleryImage(idx)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {JSON.parse(formData.gallery || '[]').length === 0 && (
                    <div className="col-span-full py-8 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Belum ada media</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded-full border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {formData.logo ? <img src={formData.logo} className="h-full w-full object-contain rounded-full p-1" alt="Logo" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <Input 
                      value={formData.logo} 
                      onChange={(e) => setFormData({...formData, logo: e.target.value})} 
                      placeholder="URL"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sampul</Label>
                  <div className="aspect-video w-full rounded border bg-muted flex items-center justify-center overflow-hidden mb-2">
                    {formData.coverImage ? <img src={formData.coverImage} className="w-full h-full object-cover" alt="Sampul" /> : <p className="text-xs text-muted-foreground">Preview</p>}
                  </div>
                  <Input 
                    value={formData.coverImage} 
                    onChange={(e) => setFormData({...formData, coverImage: e.target.value})} 
                    placeholder="URL"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/admin/education')}>
                Batal
              </Button>
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
