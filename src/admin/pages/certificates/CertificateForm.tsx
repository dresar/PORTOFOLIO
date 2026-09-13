import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { CertificateCategoryManager } from './CertificateCategoryManager';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { extractCertificateFieldsFromImageDataUrl, extractCertificateFieldsFromText } from '../../services/aiService';
import { DocumentAttachmentInput } from '@/admin/components/DocumentAttachmentInput';

export default function CertificateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: categories = [] } = useQuery({
    queryKey: ['certificate-categories'],
    queryFn: api.certificateCategories.getAll,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string>('');
  
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: '',
    image: '',
    pdfUrl: '',
    notes: '',
    verified: false,
    credentialId: '',
    categoryId: 0
  });

  useEffect(() => {
    if (isEditing) {
      loadCertificate(Number(id));
    } else {
      api.certificates.getAll().then((list: any[]) => {
        const nextId = list && list.length > 0 ? Math.max(...list.map((c: any) => Number(c.id) || 0)) + 1 : 1;
        setFormData(prev => ({ ...prev, id: nextId }));
      }).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (localImagePreview) URL.revokeObjectURL(localImagePreview);
    };
  }, [localImagePreview]);

  const loadCertificate = async (certId: number) => {
    setIsLoading(true);
    try {
      const allCerts = await api.certificates.getAll();
      const cert = allCerts.find((c: any) => Number(c.id) === certId);
      
      if (cert) {
        setFormData({
          id: Number(cert.id),
          name: cert.name,
          issuer: cert.issuer,
          issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
          credentialUrl: cert.credentialUrl || '',
          image: cert.image || '',
          pdfUrl: cert.pdfUrl || '',
          notes: cert.notes || '',
          verified: cert.verified || false,
          credentialId: cert.credentialId || '',
          categoryId: cert.categoryId || 0
        });
      } else {
        toast({ variant: "destructive", title: "Gagal!", description: "Sertifikat tidak ditemukan." });
        navigate('/admin/certificates');
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal!", description: "Gagal memuat sertifikat." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.issuer || !formData.issueDate) {
      toast({ variant: "destructive", title: "Gagal!", description: "Lengkapi data wajib." });
      return;
    }

    if (!formData.categoryId || formData.categoryId === 0) {
      toast({ variant: "destructive", title: "Kategori wajib dipilih." });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        ...formData,
        issueDate: new Date(formData.issueDate),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        image: formData.image === '' ? null : formData.image,
        pdfUrl: formData.pdfUrl === '' ? null : formData.pdfUrl,
        notes: formData.notes === '' ? null : formData.notes,
        credentialUrl: formData.credentialUrl === '' ? null : formData.credentialUrl,
        credentialId: formData.credentialId === '' ? null : formData.credentialId,
      };

      if (isEditing) {
        const numericId = Number(id);
        if (formData.id !== undefined && !isNaN(Number(formData.id)) && Number(formData.id) !== numericId) {
          payload.id = Number(formData.id);
        }
        await api.certificates.update(numericId, payload);
        toast({ title: "✓ Tersimpan!", description: "Sertifikat diperbarui." });
      } else {
        if (formData.id !== undefined && !isNaN(Number(formData.id))) {
          payload.id = Number(formData.id);
        }
        await api.certificates.create(payload);
        toast({ title: "✓ Tersimpan!", description: "Sertifikat ditambahkan." });
      }
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      navigate('/admin/certificates');
    } catch (error: any) {
      const errDetail = error?.response?.data?.detail || error?.response?.data?.error || error?.message || String(error || '');
      if (errDetail.includes('duplicate key') || errDetail.includes('already exists') || errDetail.includes('certificate_pkey')) {
        toast({
          variant: "destructive",
          title: "Gagal!",
          description: `ID ${formData.id} sudah digunakan.`
        });
      } else {
        toast({ variant: "destructive", title: "Gagal!", description: "Gagal menyimpan sertifikat." });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><ModernLoader size="lg" text="Memuat..." /></div>;
  }

  const handlePickImage = async (file: File | null) => {
    if (!file) return;
    setSelectedImageFile(file);
    if (localImagePreview) URL.revokeObjectURL(localImagePreview);
    setLocalImagePreview(URL.createObjectURL(file));
  };

  const applyIfEmpty = (current: string, next: unknown) => {
    const nextStr = typeof next === 'string' ? next.trim() : '';
    if (!nextStr) return current;
    if (current.trim()) return current;
    return nextStr;
  };

  const compressImageToDataUrl = async (file: File, maxSize = 1280, quality = 0.78) => {
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Gagal memuat gambar'));
      el.src = dataUrl;
    });

    const { width, height } = img;
    const scale = Math.min(1, maxSize / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas tidak tersedia');

    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Gagal mengompres gambar'))),
        'image/jpeg',
        quality
      );
    });

    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ''));
      r.onerror = () => reject(new Error('Gagal membaca hasil kompres'));
      r.readAsDataURL(blob);
    });
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImageFile) {
      toast({ variant: "destructive", title: "Gagal!", description: "Pilih gambar terlebih dahulu." });
      return;
    }

    setIsAnalyzing(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(selectedImageFile);
      let extracted: any;
      try {
        extracted = await extractCertificateFieldsFromImageDataUrl(compressedDataUrl);
      } catch {
        const mod: any = await import('tesseract.js');
        const Tesseract = mod?.default || mod;
        const ocr = await Tesseract.recognize(selectedImageFile, 'eng+ind');
        const text = ocr?.data?.text || '';
        extracted = await extractCertificateFieldsFromText(text);
      }

      setFormData(prev => ({
        ...prev,
        name: applyIfEmpty(prev.name, extracted.name),
        issuer: applyIfEmpty(prev.issuer, extracted.issuer),
        issueDate: applyIfEmpty(prev.issueDate, extracted.issueDate),
        expiryDate: applyIfEmpty(prev.expiryDate, extracted.expiryDate),
        credentialId: applyIfEmpty(prev.credentialId, extracted.credentialId),
        credentialUrl: applyIfEmpty(prev.credentialUrl, extracted.credentialUrl),
        verified: typeof extracted.verified === 'boolean' ? extracted.verified : prev.verified,
      }));

      toast({ title: "✓ Selesai!", description: "Form terisi otomatis." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal!", description: "Gagal menganalisis gambar." });
    } finally {
      setIsAnalyzing(false);
      setSelectedImageFile(null);
      if (localImagePreview) URL.revokeObjectURL(localImagePreview);
      setLocalImagePreview('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/certificates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Sertifikat' : 'Tambah Sertifikat'}</h2>
          <p className="text-muted-foreground">{isEditing ? 'Perbarui data sertifikat.' : 'Tambah sertifikat baru.'}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <div className="font-medium">Autofill Gambar</div>
                  <div className="text-sm text-muted-foreground">Analisis gambar untuk mengisi formulir otomatis.</div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleAnalyzeImage} disabled={isAnalyzing}>
                    {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isAnalyzing ? 'Menganalisis...' : 'Analisis'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="space-y-2">
                  <Label>Pilih Gambar</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePickImage(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="h-28 w-full rounded border overflow-hidden bg-muted flex items-center justify-center">
                    {(localImagePreview || formData.image) ? (
                      <img
                        src={localImagePreview || formData.image}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">Belum ada gambar</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 space-y-2">
                <Label>ID</Label>
                <Input 
                  type="number"
                  value={formData.id !== undefined ? formData.id : ''} 
                  onChange={e => setFormData({...formData, id: e.target.value ? Number(e.target.value) : undefined})} 
                  required 
                  placeholder="ID"
                  className="font-mono"
                />
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label>Nama</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Nama" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Penerbit</Label>
              <Input value={formData.issuer} onChange={e => setFormData({...formData, issuer: e.target.value})} required placeholder="Penerbit" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tanggal Terbit</Label>
                <Input type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Kadaluarsa (Opsional)</Label>
                <Input type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>ID Kredensial (Opsional)</Label>
              <Input value={formData.credentialId} onChange={e => setFormData({...formData, credentialId: e.target.value})} placeholder="ID" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Kategori</Label>
                <CertificateCategoryManager />
              </div>
              <Select 
                value={formData.categoryId ? formData.categoryId.toString() : "0"} 
                onValueChange={(val) => setFormData({...formData, categoryId: Number(val)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Kategori</SelectItem>
                  {[...(categories || [])]
                    .sort((a: any, b: any) => (Number(a.id) || 0) - (Number(b.id) || 0))
                    .map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        [ID: {cat.id}] {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="verified"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={formData.verified}
                onChange={e => setFormData({...formData, verified: e.target.checked})}
              />
              <Label htmlFor="verified">Verified</Label>
            </div>

            <div className="space-y-2">
              <Label>URL Kredensial</Label>
              <Input value={formData.credentialUrl} onChange={e => setFormData({...formData, credentialUrl: e.target.value})} placeholder="URL" />
            </div>

            <div className="space-y-2">
              <Label>Gambar Sampul / Pratinjau</Label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="URL Gambar" />
                </div>
                {formData.image && (
                  <div className="h-20 w-20 rounded border overflow-hidden flex-shrink-0 bg-muted">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <DocumentAttachmentInput
              label="Dokumen / PDF Sertifikat (Opsional - Multi-Halaman Didukung)"
              value={formData.pdfUrl}
              onChange={(url) => setFormData({ ...formData, pdfUrl: url })}
              notesValue={formData.notes}
              onNotesChange={(notes) => setFormData({ ...formData, notes })}
              showTitle={false}
              showNotes={true}
              notesLabel="Catatan / Keterangan Sertifikat (Opsional)"
              placeholder="URL file PDF sertifikat (misal: 2 halaman atau transkrip)..."
              previewTitle={formData.name || 'Sertifikat PDF'}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/certificates')}>Batal</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
