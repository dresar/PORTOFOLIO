
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { api } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Save, ArrowLeft, Image as ImageIcon, Sparkles, Youtube, Code, Trash2, MessageCircle, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import YoutubeExtension from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/github-dark.css';
import { BlogCategoryManager } from './BlogCategoryManager';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { normalizeMediaUrl, formatCompactNumber } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { z } from 'zod';

// Setup Lowlight
const lowlight = createLowlight(common);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('ts', ts);
lowlight.register('python', python);

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL Gambar (CDN):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt('URL YouTube:');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  return (
    <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/20 sticky top-0 z-10 backdrop-blur-sm">
      <Button variant={editor.isActive('bold') ? "default" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBold().run()}>
        B
      </Button>
      <Button variant={editor.isActive('italic') ? "default" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}>
        I
      </Button>
      <Button variant={editor.isActive('heading', { level: 2 }) ? "default" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </Button>
      <Button variant={editor.isActive('heading', { level: 3 }) ? "default" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </Button>
      <Button variant={editor.isActive('bulletList') ? "default" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>
        List
      </Button>
      <Button variant={editor.isActive('codeBlock') ? "default" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={addImage}>
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={addYoutube}>
        <Youtube className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAIBlogModalOpen, setIsAIBlogModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiPrimaryKeyword, setAiPrimaryKeyword] = useState('');
  const [aiBlogLoading, setAiBlogLoading] = useState(false);

  // Comments State
  const [newCommentName, setNewCommentName] = useState('Admin');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: api.blog.categories.getAll,
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['blog-comments-admin', id],
    queryFn: () => id ? api.blogPosts.getComments(parseInt(id)) : Promise.resolve([]),
    enabled: !!id
  });

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    categoryId: '',
    excerpt: '',
    coverImage: '',
    tags: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    is_published: false,
    published_at: undefined as Date | undefined,
    views: 0,
    likes: 0
  });

  const aiBlogSchema = z.object({
    author: z.literal('Eka Syarif Maulana'),
    title: z.string(),
    slug: z.string(),
    excerpt: z.string(),
    content_html: z.string(),
    tags: z.union([z.array(z.string()), z.string()]).optional(),
    seo_title: z.string(),
    seo_description: z.string(),
    seo_keywords: z.union([z.array(z.string()), z.string()]).optional(),
  });

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const extractFirstJsonObject = (text: string) => {
    const cleaned = text.replace(/```json/gi, '```').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    if (start === -1) return null;
    let depth = 0;
    for (let i = start; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (ch === '{') depth += 1;
      if (ch === '}') depth -= 1;
      if (depth === 0) return cleaned.slice(start, i + 1);
    }
    return null;
  };

  const coerceCsv = (val: unknown) => {
    if (!val) return '';
    if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean).join(', ');
    if (typeof val === 'string') return val;
    return String(val);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default codeBlock to use CodeBlockLowlight
        // Disable conflicting extensions
        // @ts-ignore - StarterKit might include Link in some versions
        link: false,
      }),
      Image,
      Link.configure({ openOnClick: false }),
      YoutubeExtension.configure({ controls: true, nocookie: true }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[300px]',
      },
    },
  });

  useEffect(() => {
    if (id) {
      loadPost(parseInt(id));
    }
  }, [id]);

  // Helper to safe parse JSON or array strings
  const safeParseTags = (tags: any): string => {
    if (!tags) return '';
    if (Array.isArray(tags)) return tags.join(', ');
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) return parsed.join(', ');
        return tags; // If string but not array, just return string
      } catch (e) {
        return tags; // Return raw string if parse fails
      }
    }
    return '';
  };

  const loadPost = async (postId: number) => {
    setIsLoading(true);
    try {
      // Fallback if getById is missing (HMR issue?)
      let postData;
      if (typeof api.blog.posts.getById === 'function') {
        postData = await api.blog.posts.getById(postId);
      } else {
        console.warn('api.blog.posts.getById is missing, falling back to getAll');
        const allPosts = await api.blog.posts.getAll();
        postData = allPosts.find((p: any) => p.id === postId);
      }

      if (!postData) throw new Error("Post not found");
      
      setFormData({
        title: postData.title,
        slug: postData.slug,
        // Handle both camelCase (Drizzle) and snake_case (potential raw SQL)
        categoryId: (postData.categoryId || postData.category_id || '').toString(),
        excerpt: postData.excerpt || '',
        coverImage: postData.coverImage || postData.cover_image_url || '',
        tags: safeParseTags(postData.tags),
        seo_title: postData.seo_title || '',
        seo_description: postData.seo_description || '',
        seo_keywords: safeParseTags(postData.seo_keywords),
        is_published: postData.is_published,
        published_at: postData.published_at ? new Date(postData.published_at) : undefined,
        views: postData.views || 0,
        likes: postData.likes || 0
      });
      editor?.commands.setContent(postData.content);
    } catch (error: any) {
      console.error("Failed to load post:", error);
      toast({ 
        variant: "destructive", 
        title: "Gagal memuat artikel", 
        description: error.message || "Terjadi kesalahan saat mengambil data." 
      });
      // Don't navigate away immediately so user can see the error
      // navigate('/admin/blog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIGenerateFullBlog = async () => {
    const topic = aiTopic.trim();
    if (!topic) {
      toast({ variant: "destructive", title: "Validasi Gagal", description: "Topik wajib diisi." });
      return;
    }
    if (!editor) return;

    setAiBlogLoading(true);
    try {
      const systemPrompt = [
        "Anda adalah AI penulis artikel blog profesional (Bahasa Indonesia) sekaligus SEO specialist.",
        "Tugas: dari input topik, buat 1 artikel blog yang SUPER DETAIL, siap terbit, dan siap dipaste ke editor.",
        "Penulis artikel (metadata): Eka Syarif Maulana.",
        "",
        "Aturan wajib:",
        "- Seluruh bahasa HARUS Bahasa Indonesia.",
        "- Output HARUS berupa 1 objek JSON valid, tanpa teks tambahan, tanpa markdown codefence.",
        "- Wajib ada field author dengan nilai tepat: \"Eka Syarif Maulana\".",
        "- Field 'content_html' HARUS berupa HTML valid (bukan Markdown), gunakan tag: h2, h3, p, ul, ol, li, strong, em, blockquote, pre, code, a.",
        "- Jangan buat heading bernama \"Intro\" atau \"Pendahuluan\". Mulai langsung dengan paragraf pembuka yang kuat tanpa heading.",
        "- Jangan menuliskan nama penulis di dalam content_html (nama penulis hanya ada di field author).",
        "- Jangan menyertakan informasi rahasia, kredensial, atau data pribadi.",
        "",
        "Kualitas konten:",
        "- Struktur rapi, berurutan, mudah dipahami pemula tapi tetap berguna untuk yang advanced.",
        "- Panjang: target 1800–2600 kata.",
        "- Wajib ada: pembukaan kuat, definisi/konsep inti, langkah-langkah praktis, contoh nyata, kesalahan umum & cara menghindari, checklist ringkas, FAQ (minimal 6), kesimpulan & CTA.",
        "- Bila relevan, tambahkan snippet kode atau pseudo-code di <pre><code> (tanpa backticks).",
        "- Buat tampilan estetik: paragraf ringkas, bullet list, blockquote untuk tips/peringatan, dan struktur heading yang konsisten.",
        "",
        "SEO:",
        "- Buat judul menarik (maks 70 karakter, natural, tidak clickbait berlebihan).",
        "- Buat slug kebab-case ASCII (tanpa spasi, tanpa karakter aneh).",
        "- Buat ringkasan (excerpt) 2–3 kalimat.",
        "- seo_title: 50–60 karakter, mengandung kata kunci utama.",
        "- seo_description: 140–160 karakter, mengundang klik, mengandung kata kunci.",
        "- seo_keywords: 10–16 keyword, pisahkan dengan koma atau array.",
        "- tags: 6–10 tag, relevan.",
        "",
        "Skema JSON output:",
        "{",
        '  "author": "Eka Syarif Maulana",',
        '  "title": string,',
        '  "slug": string,',
        '  "excerpt": string,',
        '  "content_html": string,',
        '  "tags": string[]|string,',
        '  "seo_title": string,',
        '  "seo_description": string,',
        '  "seo_keywords": string[]|string',
        "}",
      ].join('\n');

      const userPromptParts = [
        `Topik: ${topic}`,
        aiPrimaryKeyword.trim() ? `Kata kunci utama: ${aiPrimaryKeyword.trim()}` : "",
        "",
        "Buat artikel sesuai aturan. Pastikan content_html hanya berisi konten artikel (tanpa <html>, <head>, <body>).",
      ].filter(Boolean);

      const resp = await api.ai.generate({
        prompt: userPromptParts.join('\n'),
        systemPrompt,
        task: 'blog',
      });

      const raw = String(resp?.content || resp?.result || resp || '');
      const jsonStr = extractFirstJsonObject(raw);
      if (!jsonStr) throw new Error('AI tidak mengembalikan JSON yang valid');

      const parsed = JSON.parse(jsonStr);
      const validated = aiBlogSchema.safeParse(parsed);
      if (!validated.success) throw new Error('Format hasil AI tidak sesuai skema');

      const data = validated.data;
      const finalTitle = data.title.trim();
      const finalSlug = slugify(data.slug || finalTitle);
      const finalExcerpt = data.excerpt.trim();
      const finalSeoTitle = data.seo_title.trim();
      const finalSeoDesc = data.seo_description.trim();
      const finalSeoKeywords = coerceCsv(data.seo_keywords);
      const finalTags = coerceCsv(data.tags);

      setFormData(prev => ({
        ...prev,
        title: finalTitle,
        slug: finalSlug,
        excerpt: finalExcerpt,
        tags: finalTags,
        seo_title: finalSeoTitle,
        seo_description: finalSeoDesc,
        seo_keywords: finalSeoKeywords,
      }));

      editor.commands.setContent(data.content_html);
      setIsAIBlogModalOpen(false);
      toast({ title: "Berhasil", description: "Artikel lengkap berhasil dibuat oleh AI." });
    } catch (error: any) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;
      if (status === 429 || code === 'AI_RATE_LIMITED') {
        toast({ variant: "destructive", title: "AI Sedang Penuh", description: "Terlalu banyak permintaan. Coba lagi beberapa menit." });
      } else if (status === 503 || code === 'AI_UNAVAILABLE') {
        toast({ variant: "destructive", title: "AI Sedang Tidak Tersedia", description: "Server AI sedang sibuk. Coba lagi nanti." });
      } else {
        toast({ variant: "destructive", title: "Gagal", description: error?.message || "Gagal membuat artikel dengan AI." });
      }
    } finally {
      setAiBlogLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;

    setIsSaving(true);
    try {
      // Clamp values to PostgreSQL integer range (max 2,147,483,647)
      const MAX_INT = 2147483647;
      const safeViews = Math.min(Math.max(0, parseInt(formData.views.toString()) || 0), MAX_INT);
      const safeLikes = Math.min(Math.max(0, parseInt(formData.likes.toString()) || 0), MAX_INT);

      // Handle empty slug - auto-generate if empty
      let finalSlug = formData.slug.trim();
      if (!finalSlug) {
        finalSlug = formData.title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
          
        // Append random string to ensure uniqueness if needed (simple collision avoidance)
        // Ideally backend handles this, but frontend can try to be unique too
        // finalSlug += `-${Math.random().toString(36).substring(2, 7)}`; 
        // Better: let backend fail and we retry? Or just timestamp?
        finalSlug += `-${Date.now().toString().slice(-4)}`;
      }

      const payload = {
        ...formData,
        slug: finalSlug,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        content: editor.getHTML(),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        seo_keywords: formData.seo_keywords.split(',').map(t => t.trim()).filter(Boolean),
        cover_image_url: formData.coverImage,
        views: safeViews,
        likes: safeLikes,
        published_at: formData.published_at || new Date()
      };

      if (id) {
        await api.blog.posts.update(parseInt(id), payload);
        toast({ title: "Berhasil", description: "Artikel diperbarui." });
      } else {
        await api.blog.posts.create(payload);
        toast({ title: "Berhasil", description: "Artikel diterbitkan." });
      }
      await queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      navigate('/admin/blog');
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan saat menyimpan." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async () => {
      if (!newCommentContent || !id) return;
      setIsAddingComment(true);
      try {
          await api.blogPosts.addComment(parseInt(id), {
              name: newCommentName,
              email: 'admin@local.host',
              content: newCommentContent,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newCommentName)}&background=random`
          });
          toast({ title: "Berhasil", description: "Komentar ditambahkan." });
          setNewCommentContent('');
          refetchComments();
      } catch (error) {
          toast({ variant: "destructive", title: "Gagal", description: "Gagal menambah komentar." });
      } finally {
          setIsAddingComment(false);
      }
  };

  const handleDeleteComment = async (commentId: number) => {
      if (!confirm('Hapus komentar ini?')) return;
      try {
          await api.blogComments.delete(commentId);
          toast({ title: "Berhasil", description: "Komentar dihapus." });
          refetchComments();
      } catch (error) {
          toast({ variant: "destructive", title: "Gagal", description: "Gagal menghapus komentar." });
      }
  };

  if (isLoading) {
      return <div className="flex justify-center p-12"><ModernLoader size="lg" text="Memuat Artikel..." /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blog')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{id ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h2>
          <p className="text-muted-foreground">Buat konten menarik dengan bantuan AI.</p>
        </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => setIsAIBlogModalOpen(true)}
          disabled={!editor || aiBlogLoading}
        >
          {aiBlogLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Tulis dengan AI
        </Button>
      </div>

      <Dialog open={isAIBlogModalOpen} onOpenChange={setIsAIBlogModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tulis Artikel dengan AI</DialogTitle>
            <DialogDescription>
              Masukkan topik, lalu AI akan membuat judul, slug, ringkasan, isi konten super detail, dan SEO (Bahasa Indonesia).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Topik Artikel</Label>
              <Input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Contoh: Panduan Lengkap Belajar React untuk Pemula"
              />
            </div>
            <div className="space-y-2">
              <Label>Kata Kunci Utama (Opsional)</Label>
              <Input
                value={aiPrimaryKeyword}
                onChange={(e) => setAiPrimaryKeyword(e.target.value)}
                placeholder="Contoh: belajar react"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAIBlogModalOpen(false)} disabled={aiBlogLoading}>
                Batal
              </Button>
              <Button type="button" onClick={handleAIGenerateFullBlog} disabled={aiBlogLoading || !editor}>
                {aiBlogLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Buat Artikel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Judul Artikel</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="Contoh: Cara Belajar React untuk Pemula" 
                  className="text-lg font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Slug URL</Label>
                <Input 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  placeholder="URL slug (opsional, auto-generate dari judul)" 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Ringkasan (Excerpt)</Label>
                <Textarea 
                  value={formData.excerpt} 
                  onChange={e => setFormData({...formData, excerpt: e.target.value})} 
                  placeholder="Ringkasan singkat untuk ditampilkan di kartu..." 
                  rows={3}
                />
              </div>

              <div className="border rounded-md overflow-hidden bg-background">
                <div className="px-4 py-3 border-b bg-muted/10">
                  <div className="font-semibold">Isi Konten</div>
                  <div className="text-sm text-muted-foreground">Gunakan toolbar untuk format, gambar CDN, dan embed YouTube.</div>
                </div>
                <MenuBar editor={editor} />
                <div className="min-h-[400px]">
                    <EditorContent editor={editor} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" /> SEO & Meta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>SEO Title</Label>
                        <Input value={formData.seo_title} onChange={e => setFormData({...formData, seo_title: e.target.value})} placeholder="Title tag..." />
                    </div>
                    <div className="space-y-2">
                        <Label>SEO Keywords</Label>
                        <Input value={formData.seo_keywords} onChange={e => setFormData({...formData, seo_keywords: e.target.value})} placeholder="react, tutorial, frontend (pisahkan koma)" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>SEO Description</Label>
                    <Textarea value={formData.seo_description} onChange={e => setFormData({...formData, seo_description: e.target.value})} placeholder="Meta description..." />
                </div>
             </CardContent>
          </Card>

          {/* Comments Manager (Only if ID exists) */}
          {id && (
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" /> Manajemen Komentar
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      {/* Add Comment */}
                      <div className="space-y-4 border-b pb-4">
                          <Label>Tambah Komentar Manual</Label>
                          <div className="flex gap-2">
                              <Input 
                                  value={newCommentName} 
                                  onChange={e => setNewCommentName(e.target.value)} 
                                  placeholder="Nama" 
                                  className="w-1/3"
                              />
                              <Input 
                                  value={newCommentContent} 
                                  onChange={e => setNewCommentContent(e.target.value)} 
                                  placeholder="Isi komentar..." 
                                  className="flex-1"
                              />
                              <Button type="button" onClick={handleAddComment} disabled={isAddingComment}>
                                  <Plus className="h-4 w-4" />
                              </Button>
                          </div>
                      </div>

                      {/* List Comments */}
                      <div className="space-y-4 max-h-[300px] overflow-y-auto">
                          {comments.length === 0 ? (
                              <p className="text-center text-muted-foreground text-sm py-4">Belum ada komentar.</p>
                          ) : (
                              comments.map((comment: any) => (
                                  <div key={comment.id} className="flex justify-between items-start gap-2 bg-muted/30 p-3 rounded-md">
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className="font-bold text-sm">{comment.name}</span>
                                              <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), 'dd MMM yyyy', { locale: idLocale })}</span>
                                          </div>
                                          <p className="text-sm">{comment.content}</p>
                                      </div>
                                      <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                          onClick={() => handleDeleteComment(comment.id)}
                                          type="button"
                                      >
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                  </div>
                              ))
                          )}
                      </div>
                  </CardContent>
              </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold mb-2">Publishing</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Status Publikasi</Label>
                <Switch 
                  id="published" 
                  checked={formData.is_published} 
                  onCheckedChange={(checked) => setFormData({...formData, is_published: checked})} 
                />
              </div>
              <div className="text-sm text-muted-foreground text-right">
                {formData.is_published ? "Akan dipublikasikan" : "Simpan sebagai Draft"}
              </div>

              <div className="pt-4 border-t space-y-2">
                <Label>Tanggal Pembuatan (Opsional)</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.published_at && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.published_at ? (
                                format(formData.published_at, "PPP", { locale: idLocale })
                            ) : (
                                <span>Pilih tanggal (Default: Sekarang)</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={formData.published_at}
                            onSelect={(date) => setFormData({...formData, published_at: date})}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                    Tanggal ini akan ditampilkan sebagai waktu publikasi.
                </p>
              </div>

              {/* Custom Views & Likes */}
              <div className="pt-4 border-t space-y-4">
                  <div>
                      <Label>Jumlah Views (Manual)</Label>
                      <Input 
                          type="number" 
                          value={formData.views} 
                          onChange={e => setFormData({...formData, views: parseInt(e.target.value) || 0})}
                          className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Atur jumlah view awal.</p>
                  </div>
                  <div>
                      <Label>Jumlah Likes (Manual)</Label>
                      <Input 
                          type="number" 
                          value={formData.likes} 
                          onChange={e => setFormData({...formData, likes: parseInt(e.target.value) || 0})}
                          className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Atur jumlah like awal.</p>
                  </div>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isSaving || aiBlogLoading}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan Artikel
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold mb-2">Pengaturan</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>Kategori</Label>
                    <BlogCategoryManager />
                </div>
                <Select value={formData.categoryId} onValueChange={(val) => setFormData({...formData, categoryId: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cover Image (CDN URL)</Label>
                <div className="flex gap-2">
                    <Input value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} placeholder="https://..." />
                </div>
                {formData.coverImage && (
                    <div className="aspect-video rounded-md overflow-hidden bg-muted mt-2">
                        <img src={formData.coverImage} className="w-full h-full object-cover" />
                    </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="tech, life, coding (pisahkan koma)" />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
