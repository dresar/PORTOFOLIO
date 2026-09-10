import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { api } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Save, ArrowLeft, Image as ImageIcon, Sparkles, Youtube, Code, Trash2, MessageCircle, Plus, Copy, Check } from 'lucide-react';
import { useEditor } from '@tiptap/react';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ModernLoader } from '@/components/ui/ModernLoader';
import { RichHtmlEditor } from '@/admin/components/RichHtmlEditor';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { z } from 'zod';

const lowlight = createLowlight(common);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('js', js);
lowlight.register('ts', ts);
lowlight.register('python', python);

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

  const [isAIPromptModalOpen, setIsAIPromptModalOpen] = useState(false);
  const [numImages, setNumImages] = useState(5);
  const [aiPromptLoading, setAiPromptLoading] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<{ scene: string; prompt: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
    likes: 0,
    content: ''
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
      if (depth === 0) {
        return cleaned.slice(start, i + 1);
      }
    }
    return null;
  };

  const coerceCsv = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.map((v) => String(v).trim()).filter(Boolean).join(', ');
    }
    if (typeof value === 'string') {
      return value.trim();
    }
    return '';
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
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

  const safeParseTags = (tags: any): string => {
    if (!tags) return '';
    if (Array.isArray(tags)) return tags.join(', ');
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) return parsed.join(', ');
        return tags;
      } catch (e) {
        return tags;
      }
    }
    return '';
  };

  const loadPost = async (postId: number) => {
    setIsLoading(true);
    try {
      let postData;
      if (typeof api.blog.posts.getById === 'function') {
        postData = await api.blog.posts.getById(postId);
      } else {
        const allPosts = await api.blog.posts.getAll();
        postData = allPosts.find((p: any) => p.id === postId);
      }

      if (!postData) throw new Error("Post not found");
      
      setFormData({
        title: postData.title,
        slug: postData.slug,
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
        likes: postData.likes || 0,
        content: postData.content || ''
      });
      editor?.commands.setContent(postData.content);
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Gagal!", 
        description: "Gagal memuat artikel." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIGenerateFullBlog = async () => {
    const topic = aiTopic.trim();
    if (!topic) {
      toast({ variant: "destructive", title: "Gagal!", description: "Topik wajib diisi." });
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
        content: data.content_html
      }));

      editor.commands.setContent(data.content_html);
      setIsAIBlogModalOpen(false);
      toast({ title: "✓ Selesai!", description: "Artikel berhasil dibuat." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal!", description: "Gagal membuat artikel." });
    } finally {
      setAiBlogLoading(false);
    }
  };

  const handleCopyPrompt = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({
      title: "✓ Tersalin!"
    });
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleAIGenerateImagePrompts = async () => {
    const blogTitle = formData.title.trim();
    const blogExcerpt = formData.excerpt.trim();
    const blogContent = formData.content || (editor ? editor.getText() : '');

    if (!blogTitle && !blogContent) {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Judul atau isi artikel wajib diisi."
      });
      return;
    }

    setAiPromptLoading(true);
    setGeneratedPrompts([]);

    try {
      const systemPrompt = [
        "You are an expert AI image prompting engineer for Midjourney, DALL-E 3, and ChatGPT.",
        "Your task is to generate highly detailed, descriptive, and creative image prompts based on the provided blog article content.",
        `You must generate exactly ${numImages} distinct and unique image prompts that represent different sections, key concepts, or visual ideas of the blog post.`,
        "",
        "For each prompt, adhere to the following rules:",
        "1. Make it extremely detailed and descriptive (at least 80-120 words per prompt). Describe the scene, subjects, actions, composition, lighting, artistic style, colors, camera angle, and emotional mood.",
        "2. Format the output as a valid JSON object wrapping the array under the 'prompts' key. Do not include markdown formatting or backticks, just raw JSON.",
        "3. Avoid abstract words; focus on concrete visual elements that AI image generators can easily render.",
        "4. Use English for the prompt contents. The 'scene' field must be in Indonesian.",
        "",
        "JSON schema format:",
        "{",
        '  "prompts": [',
        "    {",
        '      "scene": "Short title in Indonesian (e.g., Gambar 1: Sampul Utama)",',
        '      "prompt": "The detailed super long image prompt here..."',
        "    }",
        "  ]",
        "}"
      ].join('\n');

      const userPromptParts = [
        `Judul Blog: ${blogTitle}`,
        blogExcerpt ? `Ringkasan Blog: ${blogExcerpt}` : '',
        `Konten Blog: ${blogContent.substring(0, 4000)}`,
        "",
        `Generate exactly ${numImages} image prompts strictly following the instructions and output format.`
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
      if (Array.isArray(parsed.prompts) && parsed.prompts.length > 0) {
        setGeneratedPrompts(parsed.prompts);
        toast({ title: "✓ Selesai!", description: "Prompt gambar berhasil dibuat." });
      } else {
        throw new Error('Prompts tidak ditemukan');
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Gagal!",
        description: "Gagal membuat prompt gambar."
      });
    } finally {
      setAiPromptLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const safeViews = Number.isInteger(Number(formData.views)) && Number(formData.views) >= 0 
        ? Number(formData.views) 
        : 0;

      const safeLikes = Number.isInteger(Number(formData.likes)) && Number(formData.likes) >= 0 
        ? Number(formData.likes) 
        : 0;

      let finalSlug = formData.slug ? slugify(formData.slug) : slugify(formData.title);
      
      if (!finalSlug) {
        finalSlug = `post-${Date.now()}`;
      }

      const payload = {
        ...formData,
        slug: finalSlug,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        content: formData.content,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        seo_keywords: formData.seo_keywords.split(',').map(t => t.trim()).filter(Boolean),
        cover_image_url: formData.coverImage,
        views: safeViews,
        likes: safeLikes,
        published_at: formData.published_at || new Date()
      };

      if (id) {
        await api.blog.posts.update(parseInt(id), payload);
        toast({ title: "✓ Tersimpan!", description: "Artikel diperbarui." });
      } else {
        await api.blog.posts.create(payload);
        toast({ title: "✓ Tersimpan!", description: "Artikel diterbitkan." });
      }
      await queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      navigate('/admin/blog');
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal!", description: "Gagal menyimpan artikel." });
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
      toast({ title: "✓ Tersimpan!", description: "Komentar ditambahkan." });
      setNewCommentContent('');
      refetchComments();
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal!", description: "Gagal menambah komentar." });
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Hapus komentar ini?')) return;
    try {
      await api.blogComments.delete(commentId);
      toast({ title: "✓ Dihapus!", description: "Komentar dihapus." });
      refetchComments();
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal!", description: "Gagal menghapus komentar." });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><ModernLoader size="lg" text="Memuat..." /></div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{id ? 'Edit Artikel' : 'Tulis Artikel'}</h2>
            <p className="text-muted-foreground">Konten artikel portofolio.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => setIsAIBlogModalOpen(true)}
            disabled={aiBlogLoading}
          >
            {aiBlogLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Tulis AI
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
            onClick={() => setIsAIPromptModalOpen(true)}
            disabled={aiBlogLoading || aiPromptLoading}
          >
            <ImageIcon className="h-4 w-4 text-purple-500" />
            Prompt Gambar
          </Button>
        </div>
      </div>

      <Dialog open={isAIBlogModalOpen} onOpenChange={setIsAIBlogModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tulis Artikel AI</DialogTitle>
            <DialogDescription>
              Generate judul, slug, ringkasan, dan konten otomatis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Topik</Label>
              <Input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Topik"
              />
            </div>
            <div className="space-y-2">
              <Label>Kata Kunci (Opsional)</Label>
              <Input
                value={aiPrimaryKeyword}
                onChange={(e) => setAiPrimaryKeyword(e.target.value)}
                placeholder="Kata Kunci"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAIBlogModalOpen(false)} disabled={aiBlogLoading}>
                Batal
              </Button>
              <Button type="button" onClick={handleAIGenerateFullBlog} disabled={aiBlogLoading}>
                {aiBlogLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Generate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAIPromptModalOpen} onOpenChange={setIsAIPromptModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <ImageIcon className="h-5 w-5" />
              Prompt Gambar
            </DialogTitle>
            <DialogDescription>
              Prompting visual detail untuk gambar artikel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 my-4">
            <div className="space-y-3 bg-muted/40 p-4 rounded-lg border border-purple-500/10">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-semibold">Jumlah Gambar</Label>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {numImages}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tentukan jumlah scene visual gambar.
              </p>
              <div className="pt-2">
                <Slider
                  value={[numImages]}
                  onValueChange={(val) => setNumImages(val[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAIPromptModalOpen(false)} disabled={aiPromptLoading}>
                Batal
              </Button>
              <Button
                type="button"
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                onClick={handleAIGenerateImagePrompts}
                disabled={aiPromptLoading}
              >
                {aiPromptLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate
              </Button>
            </div>

            {aiPromptLoading && (
              <div className="flex flex-col items-center justify-center p-8 space-y-4 border rounded-lg bg-muted/20 animate-pulse">
                <ModernLoader size="md" text="Menyusun prompt..." />
              </div>
            )}

            {generatedPrompts.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-sm text-foreground/80 border-b pb-2">Hasil Prompt ({generatedPrompts.length})</h4>
                <div className="space-y-4">
                  {generatedPrompts.map((item, index) => (
                    <div key={index} className="border border-purple-500/10 rounded-lg overflow-hidden bg-card shadow-sm">
                      <div className="flex justify-between items-center bg-muted/40 px-4 py-2 border-b border-purple-500/10">
                        <span className="font-medium text-sm text-purple-600 dark:text-purple-400">
                          {item.scene || `Scene ${index + 1}`}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400"
                          onClick={() => handleCopyPrompt(item.prompt, index)}
                        >
                          {copiedIndex === index ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">Salin</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="p-4 bg-muted/10">
                        <p className="text-sm font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed select-all">
                          {item.prompt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="Judul" 
                  className="text-lg font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  placeholder="Slug" 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Ringkasan</Label>
                <Textarea 
                  value={formData.excerpt} 
                  onChange={e => setFormData({...formData, excerpt: e.target.value})} 
                  placeholder="Ringkasan" 
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-base">Konten</Label>
                <RichHtmlEditor 
                  value={formData.content} 
                  onChange={(content) => setFormData({...formData, content})}
                  placeholder="Konten"
                />
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
                        <Label>Judul</Label>
                        <Input value={formData.seo_title} onChange={e => setFormData({...formData, seo_title: e.target.value})} placeholder="Judul" />
                    </div>
                    <div className="space-y-2">
                        <Label>Kata Kunci</Label>
                        <Input value={formData.seo_keywords} onChange={e => setFormData({...formData, seo_keywords: e.target.value})} placeholder="Kata Kunci" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Deskripsi</Label>
                    <Textarea value={formData.seo_description} onChange={e => setFormData({...formData, seo_description: e.target.value})} placeholder="Deskripsi" />
                </div>
             </CardContent>
          </Card>

          {id && (
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" /> Komentar
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="space-y-4 border-b pb-4">
                          <Label>Tambah Komentar</Label>
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
                                  placeholder="Komentar" 
                                  className="flex-1"
                              />
                              <Button type="button" onClick={handleAddComment} disabled={isAddingComment}>
                                  <Plus className="h-4 w-4" />
                              </Button>
                          </div>
                      </div>

                      <div className="space-y-4 max-h-[300px] overflow-y-auto">
                          {comments.length === 0 ? (
                              <p className="text-center text-muted-foreground text-sm py-4">Belum ada komentar</p>
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
              <h3 className="font-semibold mb-2">Publikasi</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Publikasi</Label>
                <Switch 
                  id="published" 
                  checked={formData.is_published} 
                  onCheckedChange={(checked) => setFormData({...formData, is_published: checked})} 
                />
              </div>
              <div className="text-sm text-muted-foreground text-right">
                {formData.is_published ? "Publik" : "Draft"}
              </div>

              <div className="pt-4 border-t space-y-2">
                <Label>Tanggal</Label>
                <CustomDatePicker
                  value={formData.published_at || null}
                  onChange={(date) => setFormData({ ...formData, published_at: date || undefined })}
                  placeholder="Tanggal"
                  minYear={2022}
                  maxYear={2040}
                />
                <p className="text-xs text-muted-foreground">
                  Format YYYY-MM-DD atau pilih kalender.
                </p>
              </div>

              <div className="pt-4 border-t space-y-4">
                  <div>
                      <Label>Views</Label>
                      <Input 
                          type="number" 
                          value={formData.views} 
                          onChange={e => setFormData({...formData, views: parseInt(e.target.value) || 0})}
                          placeholder="Views"
                          className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Jumlah tayangan awal.</p>
                  </div>
                  <div>
                      <Label>Likes</Label>
                      <Input 
                          type="number" 
                          value={formData.likes} 
                          onChange={e => setFormData({...formData, likes: parseInt(e.target.value) || 0})}
                          placeholder="Likes"
                          className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Jumlah suka awal.</p>
                  </div>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isSaving || aiBlogLoading}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan
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
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sampul</Label>
                <div className="flex gap-2">
                    <Input value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} placeholder="URL" />
                </div>
                {formData.coverImage && (
                    <div className="aspect-video rounded-md overflow-hidden bg-muted mt-2">
                        <img src={formData.coverImage} className="w-full h-full object-cover" alt="Sampul" />
                    </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tag</Label>
                <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="Tag" />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
