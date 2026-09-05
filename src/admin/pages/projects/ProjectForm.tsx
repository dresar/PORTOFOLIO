
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../services/api';
import { Loader2, Plus, Trash2, ArrowLeft, Image as ImageIcon, Sparkles, Github, Wand2, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { normalizeMediaUrl, safeJsonParse } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { useTheme } from 'next-themes';
import { CategoryManager } from './CategoryManager';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { RichHtmlEditor } from '@/admin/components/RichHtmlEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

const projectSchema = z.object({
    title: z.string().min(1, "Judul diperlukan"),
    slug: z.string().optional(),
    categoryId: z.coerce.number({ invalid_type_error: "Kategori wajib dipilih" }).min(1, "Kategori wajib dipilih"),
    description: z.string().optional(), // Short description
  content: z.string().optional(), // Markdown content
  coverImage: z.string().optional(),
  videoUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  tech: z.string().optional(), // Comma separated
  gallery: z.string().optional(), // JSON string
  is_published: z.boolean().default(true),
  custom_created_at: z.date().optional(),
  order: z.coerce.number().default(0),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

// Helper to parse both Postgres array strings (e.g. {"a", "b"}) and JSON array strings (e.g. ["a", "b"])
const parsePgOrJsonArray = (val: any): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];

    // Case 1: Standard JSON Array
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          // Check for double-encoding: if first element is a JSON string or PG array string
          return parsed.flatMap(item => parsePgOrJsonArray(item));
        }
      } catch (e) {
        // Fall through
      }
    }

    // Case 2: Postgres Array Format: {"val1","val2"}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const content = trimmed.slice(1, -1);
      if (!content) return [];
      
      const items: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          items.push(current.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"'));
          current = '';
        } else {
          current += char;
        }
      }
      if (current) {
        items.push(current.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"'));
      }
      return items.filter(Boolean);
    }

    // Case 3: Comma separated values (fallback)
    return trimmed.split(',').map(t => t.trim()).filter(Boolean);
  }
  return [];
};

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['project-categories'],
    queryFn: api.projectCategories.getAll,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isManualSummaryOpen, setIsManualSummaryOpen] = useState(false);
  const [manualSummaryContent, setManualSummaryContent] = useState('');

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      is_published: true,
      tech: '',
      gallery: '[]',
      content: '',
      description: '',
      order: 0
    }
  });

  // Watch gallery to display preview
  const galleryJson = form.watch('gallery');
  const gallery = safeJsonParse(galleryJson, []);

  useEffect(() => {
    if (id) {
      loadProject(Number(id));
    }
  }, [id]);

  const loadProject = async (projectId: number) => {
    setIsLoading(true);
    try {
      // Use the new specific getById endpoint
      const project = await api.projects.getById(projectId);
      
      if (project) {
        form.reset({
          title: project.title,
          slug: project.slug || '',
          categoryId: project.categoryId,
          description: project.description,
          content: project.content,
          coverImage: project.coverImage || '',
          videoUrl: project.videoUrl || '',
          demoUrl: project.demoUrl || '',
          repoUrl: project.repoUrl || '',
          tech: parsePgOrJsonArray(project.tech).join(', '),
          gallery: JSON.stringify(parsePgOrJsonArray(project.gallery)),
          is_published: project.is_published,
          custom_created_at: project.custom_created_at ? new Date(project.custom_created_at) : undefined,
          order: project.order ?? 0,
        });
        
        if (project.summaries) {
            try {
                let parsedSummaries = project.summaries;
                if (typeof parsedSummaries === 'string') {
                    parsedSummaries = JSON.parse(parsedSummaries);
                    // Handle double stringification
                    if (typeof parsedSummaries === 'string') {
                        parsedSummaries = JSON.parse(parsedSummaries);
                    }
                }
                
                if (Array.isArray(parsedSummaries)) {
                    // Filter out corrupted empty summaries
                    const validSummaries = parsedSummaries.filter(s => s && (s.content || s.text || s.summary));
                    setSummaries(validSummaries);
                } else {
                    setSummaries([]);
                }
            } catch (e) {
                console.error("Failed to parse summaries", e);
                setSummaries([]);
            }
        }
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal memuat data", description: "Project tidak ditemukan atau terjadi kesalahan." });
      navigate('/admin/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      const formattedData: any = {
        ...data,
        tech: JSON.stringify(parsePgOrJsonArray(data.tech)),
        gallery: JSON.stringify(parsePgOrJsonArray(data.gallery)),
        summaries: JSON.stringify(summaries),
      };

      if (data.custom_created_at) {
          formattedData.custom_created_at = data.custom_created_at.toISOString();
      } else {
          formattedData.custom_created_at = null;
      }

      if (id) {
        await api.projects.update(Number(id), formattedData);
        toast({ title: "Berhasil", description: "Project diperbarui." });
        await queryClient.invalidateQueries({ queryKey: ['projects'] });
        navigate('/admin/projects');
      } else {
        const res = await api.projects.create(formattedData);
        toast({ title: "Berhasil", description: "Project dibuat." });
        await queryClient.invalidateQueries({ queryKey: ['projects'] });
        navigate('/admin/projects');
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal menyimpan" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyzeGithub = async () => {
      const repoUrl = form.getValues('repoUrl');
      if (!repoUrl) {
          toast({ variant: "destructive", title: "Repo URL Kosong", description: "Masukkan link GitHub terlebih dahulu." });
          return;
      }
      
      setIsAnalyzing(true);
      try {
          const result = await api.ai.analyzeGithub(repoUrl);
          if (result.content) {
              form.setValue('content', result.content, { shouldDirty: true });
              toast({ title: "Analisis Selesai", description: "Deskripsi project berhasil di-generate dari GitHub." });
          }
      } catch (e: any) {
          if (e.response?.status === 404 && e.response?.data?.isPrivate) {
              toast({ variant: "destructive", title: "Repo Tidak Ditemukan / Private", description: e.response.data.error });
          } else {
              toast({ variant: "destructive", title: "Gagal", description: "Gagal menganalisis repo GitHub." });
          }
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleGenerateContentFromDescription = async () => {
      const description = form.getValues('description');
      const title = form.getValues('title');
      
      if (!description) {
          toast({ variant: "destructive", title: "Deskripsi Kosong", description: "Isi deskripsi singkat terlebih dahulu." });
          return;
      }

      setIsGeneratingContent(true);
      try {
          const prompt = `
            Buatkan konten detail project (Markdown) untuk portofolio berdasarkan informasi ini:
            Judul: ${title}
            Deskripsi Singkat: ${description}

            Instruksi:
            1. Buat bagian "About the Project" yang menjelaskan lebih detail.
            2. Buat daftar "Key Features" yang relevan dengan deskripsi.
            3. Buat daftar "Tech Stack" yang mungkin digunakan (perkirakan saja jika tidak ada info).
            4. Gunakan bahasa yang profesional dan menarik.
            5. Format dalam Markdown.
          `;
          
          const result = await api.ai.generateContent({ prompt });
          if (result.content) {
              form.setValue('content', result.content, { shouldDirty: true });
              toast({ title: "Konten Dibuat", description: "Detail project berhasil di-generate dari deskripsi." });
          }
      } catch (e) {
          toast({ variant: "destructive", title: "Gagal", description: "Gagal generate konten." });
      } finally {
          setIsGeneratingContent(false);
      }
  };

  const handleGenerateShortSummary = async () => {
      const title = form.getValues('title');
      const base = form.getValues('content') || form.getValues('description') || title;
      if (!title && !base) {
          toast({ variant: "destructive", title: "Data Kurang", description: "Isi judul atau deskripsi terlebih dahulu." });
          return;
      }
      setIsGeneratingSummary(true);
      try {
          const prompt = `
            Buat ringkasan singkat (maks 3 kalimat) dalam bahasa Indonesia untuk kartu project.
            Judul: ${title}
            Konteks: ${base}
          `;
          const result = await api.ai.generateContent({ prompt });
          if (result.content) {
              form.setValue('description', result.content, { shouldDirty: true });
              toast({ title: "Ringkasan Dibuat", description: "Deskripsi singkat diisi oleh AI." });
          }
      } catch (_) {
          toast({ variant: "destructive", title: "Gagal", description: "Tidak dapat membuat ringkasan." });
      } finally {
          setIsGeneratingSummary(false);
      }
  };

  const handleManualSummary = () => {
      setManualSummaryContent('');
      setIsManualSummaryOpen(true);
  };

  const handleSaveManualSummary = async () => {
      if (!manualSummaryContent.trim()) return;
      
      if (id) {
          try {
            const res = await api.projects.createSummary(Number(id), { content: manualSummaryContent, variant: 'Manual' });
            setSummaries(prev => [res, ...prev]);
            toast({ title: "Berhasil", description: "Summary manual ditambahkan." });
            setIsManualSummaryOpen(false);
          } catch (error) {
            toast({ variant: "destructive", title: "Gagal", description: "Gagal menyimpan summary." });
          }
      } else {
          // Local state for new project
          const newSummary = {
              id: Date.now(), // Temp ID
              content: manualSummaryContent,
              variant: 'Manual',
              createdAt: new Date().toISOString()
          };
          setSummaries(prev => [newSummary, ...prev]);
          toast({ title: "Berhasil", description: "Summary ditambahkan (akan disimpan saat project dibuat)." });
          setIsManualSummaryOpen(false);
      }
  };

  const handleGenerateSummary = async () => {
      setIsAnalyzing(true);
      try {
          // Generate Summary based on Content
          const content = form.getValues('content') || form.getValues('description') || form.getValues('title');
          const prompt = `
            Buatkan ringkasan menarik untuk project ini dalam 1 paragraf pendek (max 3 kalimat).
            Gunakan bahasa Indonesia yang profesional.
            
            Konteks Project:
            ${content}
          `;
          
          const result = await api.ai.generateContent({ prompt });
          
          if (id) {
            // Save to DB
            await api.projects.createSummary(Number(id), { content: result.content, variant: 'AI Generated' });
            // Refresh summaries
            setSummaries(prev => [{ id: Date.now(), content: result.content, variant: 'AI Generated', createdAt: new Date().toISOString() }, ...prev]);
            toast({ title: "Summary Dibuat", description: "Ringkasan baru berhasil ditambahkan." });
          } else {
             // Local state only
            const newSummary = {
                id: Date.now(),
                content: result.content,
                variant: 'AI Generated',
                createdAt: new Date().toISOString()
            };
            setSummaries(prev => [newSummary, ...prev]);
            toast({ title: "Summary Dibuat", description: "Ringkasan berhasil di-generate (akan disimpan saat project dibuat)." });
          }
      } catch (e) {
          toast({ variant: "destructive", title: "Gagal", description: "Gagal membuat summary." });
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleAddGalleryImage = () => {
      const url = prompt("Masukkan URL Gambar (CDN):");
      if (url) {
          const current = parsePgOrJsonArray(form.getValues('gallery'));
          const updated = [...current, url];
          form.setValue('gallery', JSON.stringify(updated), { shouldDirty: true });
      }
  };

  const handleRemoveGalleryImage = (index: number) => {
      const current = parsePgOrJsonArray(form.getValues('gallery'));
      const updated = current.filter((_: any, i: number) => i !== index);
      form.setValue('gallery', JSON.stringify(updated), { shouldDirty: true });
  };

  const onError = (errors: any) => {
      if (errors.categoryId) {
          toast({ variant: "destructive", title: "Validasi Gagal", description: "Mohon pilih Kategori Project terlebih dahulu." });
      } else if (errors.title) {
          toast({ variant: "destructive", title: "Validasi Gagal", description: "Judul project wajib diisi." });
      } else {
          toast({ variant: "destructive", title: "Validasi Gagal", description: "Mohon lengkapi data yang diperlukan." });
      }
  };

  if (isLoading) return <div className="flex justify-center p-12"><ModernLoader size="lg" text="Memuat Project..." /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/projects')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{id ? 'Edit Project' : 'Tambah Project Baru'}</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Utama</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Judul Project</Label>
                            <Input {...form.register('title')} placeholder="Nama Project" />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Slug (Opsional)</Label>
                            <Input {...form.register('slug')} placeholder="url-project-anda" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Repository URL (GitHub)</Label>
                                <div className="flex gap-2">
                                    <Input {...form.register('repoUrl')} placeholder="https://github.com/username/repo" />
                                    <Button type="button" variant="outline" size="icon" onClick={handleAnalyzeGithub} disabled={isAnalyzing} title="Analyze with AI">
                                        {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 text-purple-500" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Klik tongkat ajaib untuk generate deskripsi otomatis dari GitHub.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Live Demo URL</Label>
                                <Input {...form.register('demoUrl')} placeholder="https://project-demo.com" />
                            </div>
                        </div>
                        
                         <div className="space-y-2">
                            <Label>Video URL (Cloudinary CDN / MP4 / YouTube)</Label>
                            <Input {...form.register('videoUrl')} placeholder="https://res.cloudinary.com/.../video.mp4 atau https://youtube.com/watch?v=..." />
                        </div>

                        <div className="space-y-2">
                            <Label>Tech Stack (Pisahkan dengan koma)</Label>
                            <Input {...form.register('tech')} placeholder="React, Node.js, Prisma, Tailwind" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Konten & Deskripsi</CardTitle>
                        <Badge variant="outline" className="ml-2">Markdown Supported</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Deskripsi Singkat</Label>
                                <div className="flex gap-2">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleGenerateShortSummary}
                                        disabled={isGeneratingSummary}
                                        className="h-8 text-xs"
                                    >
                                        {isGeneratingSummary ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2 text-purple-500" />}
                                        Generate Ringkasan AI
                                    </Button>
                                </div>
                            </div>
                            <Textarea {...form.register('description')} placeholder="Ringkasan pendek untuk kartu project..." />
                            <p className="text-xs text-muted-foreground">Digunakan untuk kartu project dan bisa jadi dasar generate konten detail.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-base font-semibold">Konten Lengkap (Project Detail)</Label>
                            <RichHtmlEditor 
                                value={form.watch('content') || ''}
                                onChange={(val) => form.setValue('content', val, { shouldDirty: true })}
                                placeholder="Tuliskan konten detail proyek dalam format HTML atau teks biasa..."
                                onAIGenerate={handleGenerateContentFromDescription}
                            />
                        </div>
                    </CardContent>
                </Card>
                
                {/* AI Summaries Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-500" />
                                <CardTitle>AI Summaries (Unlimited Variations)</CardTitle>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={handleManualSummary}>
                                    <Plus className="h-4 w-4 mr-2" /> Manual
                                </Button>
                                <Button type="button" size="sm" onClick={handleGenerateSummary} disabled={isAnalyzing}>
                                    {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                                    Generate AI
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {summaries.length === 0 ? (
                                    <p className="text-muted-foreground text-sm italic">Belum ada summary. Klik generate untuk membuat.</p>
                                ) : (
                                    summaries.map((summary, idx) => (
                                        <div key={idx} className="p-4 bg-muted/50 rounded-lg border relative group">
                                            <p className="text-sm leading-relaxed">{summary.content || summary.text || summary.summary || 'No content available'}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <Badge variant="secondary" className="text-xs">{summary.variant || 'Standard'}</Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {summary.createdAt ? new Date(summary.createdAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={async () => {
                                                    if(!summary.id) return;
                                                    if (id) {
                                                        try {
                                                            await api.projects.deleteSummary(Number(id), summary.id);
                                                        } catch (e) { console.error(e); }
                                                    }
                                                    setSummaries(prev => prev.filter(s => s.id !== summary.id));
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
            </div>

            {/* Right Column: Media & Settings */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Media</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-2">
                            <Label>Cover Image (URL)</Label>
                            <div className="flex gap-2">
                                <Input {...form.register('coverImage')} placeholder="https://..." />
                            </div>
                            {form.watch('coverImage') && (
                                <div className="mt-2 aspect-video rounded-md overflow-hidden border">
                                    <img src={form.watch('coverImage')} alt="Cover" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Project Gallery (Unlimited)</Label>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                {gallery.map((img: string, idx: number) => (
                                    <div key={idx} className="relative aspect-square rounded-md overflow-hidden border group">
                                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveGalleryImage(idx)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="aspect-square flex flex-col items-center justify-center gap-2 h-auto"
                                    onClick={handleAddGalleryImage}
                                >
                                    <Plus className="h-6 w-6" />
                                    <span className="text-xs">Add URL</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pengaturan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Kategori</Label>
                                <CategoryManager />
                            </div>
                            <Controller
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <Select
                                        value={field.value ? field.value.toString() : "0"}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">Pilih Kategori...</SelectItem>
                                            {(Array.isArray(categories) ? categories : []).map((cat: any) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name || '-'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.categoryId && (
                                <p className="text-sm text-destructive mt-1">{form.formState.errors.categoryId.message}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Status Publikasi</Label>
                                <p className="text-xs text-muted-foreground">Tampilkan di portfolio publik</p>
                            </div>
                            <Switch 
                                checked={form.watch('is_published')}
                                onCheckedChange={(checked) => form.setValue('is_published', checked, { shouldDirty: true })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Urutan Tampilan</Label>
                            <Input 
                                type="number" 
                                {...form.register('order', { valueAsNumber: true })} 
                                placeholder="0" 
                            />
                            <p className="text-xs text-muted-foreground">
                                Angka lebih kecil akan muncul pertama kali di halaman portfolio (misal: 0, 1, 2, dst).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Tanggal Pembuatan (Opsional)</Label>
                            <Controller
                                control={form.control}
                                name="custom_created_at"
                                render={({ field }) => (
                                    <CustomDatePicker
                                        value={field.value}
                                        onChange={(date) => field.onChange(date)}
                                        placeholder="Pilih atau ketik tanggal (Default: Hari ini)"
                                        minYear={2022}
                                        maxYear={2040}
                                    />
                                )}
                            />
                            <p className="text-xs text-muted-foreground">
                                Bisa diketik manual (YYYY-MM-DD / DD/MM/YYYY) atau pilih dari dropdown Bulan & Tahun (2022-2040).
                            </p>
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {id ? 'Simpan Perubahan' : 'Buat Project'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </form>

      <Dialog open={isManualSummaryOpen} onOpenChange={setIsManualSummaryOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Tambah Summary Manual</DialogTitle>
                <DialogDescription>
                    Tulis ringkasan manual untuk project ini. Ini akan muncul dalam rotasi "AI Summary" di halaman publik.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Konten Ringkasan</Label>
                    <Textarea 
                        value={manualSummaryContent}
                        onChange={(e) => setManualSummaryContent(e.target.value)}
                        placeholder="Project ini adalah..."
                        className="min-h-[100px]"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsManualSummaryOpen(false)}>Batal</Button>
                <Button onClick={handleSaveManualSummary}>Simpan Summary</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
