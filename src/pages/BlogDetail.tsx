import { useEffect, useLayoutEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlogPostBySlug } from '@/hooks/useBlog';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BlogSlidePlayer } from '@/components/blog/BlogSlidePlayer';
import { normalizeMediaUrl, formatCompactNumber, sanitizeHtmlContent } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Calendar, User, ArrowLeft, Share2, Heart, Eye, MessageCircle, Send, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Helmet } from 'react-helmet-async';
import { FloatingWhatsApp } from '@/components/effects/FloatingWhatsApp';
import { ScrollToTop } from '@/components/effects/ScrollToTop';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlobalModal } from '@/components/GlobalModal';
import { useModalStore } from '@/store/modalStore';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { getLocalizedPath } from '@/lib/i18nNavigation';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';
import { useTheme } from 'next-themes';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const BlogDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [slug]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const { openImagePreviewModal } = useModalStore();
  const { resolvedTheme } = useTheme();
  
  const { data: rawPost, isLoading, isError } = useBlogPostBySlug(slug || '');
  const { getBlogPost } = useLocalizedContent();
  const post = getBlogPost(rawPost);
  
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comments Query
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['blog-comments', post?.id],
    queryFn: () => api.blogPosts.getComments(post.id),
    enabled: !!post?.id,
  });

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: (variables: { id: number, count: number }) => api.blogPosts.like(variables.id, variables.count),
    onSuccess: (data) => {
      queryClient.setQueryData(['blog-post', slug], (old: any) => ({
        ...old,
        likes: data.likes
      }));
    }
  });

  // View Mutation
  const viewMutation = useMutation({
    mutationFn: (id: number) => api.blogPosts.view(id),
    onSuccess: (data) => {
        // Update view count in cache silently
        queryClient.setQueryData(['blog-post', slug], (old: any) => ({
            ...old,
            views: data.views
        }));
    }
  });

  // Comment Mutation
  const commentMutation = useMutation({
    mutationFn: (data: any) => api.blogPosts.addComment(post.id, data),
    onSuccess: (newComment) => {
      // Optimistic Update: Manually add new comment to cache
      queryClient.setQueryData(['blog-comments', post?.id], (old: any) => {
          return [newComment, ...(Array.isArray(old) ? old : [])];
      });
      
      // Update comment count in post detail cache
      queryClient.setQueryData(['blog-post', slug], (old: any) => ({
          ...old,
          comments_count: (old?.comments_count || 0) + 1
      }));

      queryClient.invalidateQueries({ queryKey: ['blog-comments', post?.id] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', slug] }); 
      
      setCommentContent('');
      setCommentName('');
      setCommentEmail('');
      toast.success('Komentar Terkirim!');
    },
    onError: () => {
      toast.error('Gagal Mengirim!');
    }
  });

  // Scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Trigger View Count
  useEffect(() => {
    if (post?.id) {
        // Simple debounce check or just run once per mount
        const viewedKey = `viewed_post_${post.id}`;
        if (!sessionStorage.getItem(viewedKey)) {
            viewMutation.mutate(post.id);
            sessionStorage.setItem(viewedKey, 'true');
        }
    }
  }, [post?.id]);

  const [pendingLikes, setPendingLikes] = useState(0);
  const [lastLikeTime, setLastLikeTime] = useState(0);

  // Debounced Like Logic
  useEffect(() => {
    if (pendingLikes === 0) return;

    const timeout = setTimeout(() => {
        if (post?.id) {
            likeMutation.mutate({ id: post.id, count: pendingLikes });
            setPendingLikes(0);
        }
    }, 2000); // Wait 2 seconds of inactivity before sending

    return () => clearTimeout(timeout);
  }, [pendingLikes, post?.id]);

  const handleLike = () => {
    if (post?.id) {
        // Optimistic UI Update immediately
        queryClient.setQueryData(['blog-post', slug], (old: any) => ({
            ...old,
            likes: (old?.likes || 0) + 1
        }));
        
        setPendingLikes(prev => prev + 1);
        setLastLikeTime(Date.now());
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentContent) {
        toast.error('Nama dan komentar wajib diisi');
        return;
    }
    
    setIsSubmitting(true);
    commentMutation.mutate({
        name: commentName,
        email: commentEmail,
        content: commentContent,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(commentName)}&background=random` // CDN Avatar
    }, {
        onSettled: () => setIsSubmitting(false)
    });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = post?.title;
    
    if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`, '_blank');
    } else if (platform === 'copy') {
        navigator.clipboard.writeText(url);
        toast.success('Link berhasil disalin!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-16 container mx-auto px-4 max-w-6xl">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-4">
               <Skeleton className="h-8 w-3/4 mb-4" />
               <Skeleton className="h-4 w-1/2 mb-8" />
               <Skeleton className="h-96 w-full rounded-xl mb-8" />
             </div>
             <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-40 w-full rounded-xl" />
             </div>
           </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">{t('blog.not_found')}</h1>
                <Button onClick={() => navigate(getLocalizedPath('/blog'))} variant="outline">
                    {t('blog.back_to_blog')}
                </Button>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb / Back */}
          <Helmet>
            <title>{post.seo_title || post.title} - Eka Syarif Maulana</title>
            <meta name="description" content={post.seo_description || post.excerpt} />
            <meta name="author" content="Eka Syarif Maulana, S.Kom" />
            <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : `https://etech.my.id/id/blog/${slug}`} />
            <link rel="alternate" type="text/markdown" href={`https://etech.my.id/uploads/articles/${slug}/README.md`} />
            {post.seo_keywords && post.seo_keywords.length > 0 && (
              <meta name="keywords" content={Array.isArray(post.seo_keywords) ? post.seo_keywords.join(', ') : post.seo_keywords} />
            )}
            <meta property="og:title" content={`${post.seo_title || post.title} - Eka Syarif Maulana`} />
            <meta property="og:description" content={post.seo_description || post.excerpt} />
            <meta property="og:type" content="article" />
            <meta property="article:author" content="Eka Syarif Maulana" />
            {(post.coverImageFile || post.coverImage || post.cover_image) && (
              <meta property="og:image" content={normalizeMediaUrl(post.coverImageFile || post.coverImage || post.cover_image)} />
            )}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={`${post.seo_title || post.title} - Eka Syarif Maulana`} />
            <meta name="twitter:description" content={post.seo_description || post.excerpt} />
            {(post.coverImageFile || post.coverImage || post.cover_image) && (
              <meta name="twitter:image" content={normalizeMediaUrl(post.coverImageFile || post.coverImage || post.cover_image)} />
            )}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt,
                "image": (post.coverImage || post.cover_image) ? normalizeMediaUrl(post.coverImage || post.cover_image) : undefined,
                "datePublished": post.published_at || post.created_at,
                "dateModified": post.updated_at || post.created_at,
                "author": {
                  "@type": "Person",
                  "name": "Eka Syarif Maulana, S.Kom",
                  "jobTitle": "Senior Fullstack Web & Mobile Developer & AI Systems Engineer",
                  "url": "https://etech.my.id"
                },
                "publisher": {
                  "@type": "Person",
                  "name": "Eka Syarif Maulana, S.Kom",
                  "url": "https://etech.my.id"
                },
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": typeof window !== 'undefined' ? window.location.href : `https://etech.my.id/id/blog/${slug}`
                }
              })}
            </script>
          </Helmet>

          <div className="mb-6">
            <Link 
              to={getLocalizedPath('/blog')} 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-1 px-3 rounded-lg hover:bg-muted/50 w-fit"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('blog.back_to_blog')}
            </Link>
          </div>

          {/* Article Title & Metadata Header */}
          <header className="mb-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-xs sm:text-sm text-muted-foreground">
              <Badge variant="secondary" className="font-semibold tracking-wide uppercase px-2.5 py-0.5">
                {post.category?.name || t('blog.default_category')}
              </Badge>
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary" />
                {format(new Date(post.published_at || post.created_at), 'd MMMM yyyy', { locale: idLocale })}
              </span>
              <span className="flex items-center text-foreground font-medium">
                <User className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Eka Syarif Maulana, S.Kom
              </span>
              <span className="flex items-center font-medium text-primary">
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                {formatCompactNumber(post.views || 0)} views
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-5 leading-tight tracking-tight text-foreground">
              {post.title}
            </h1>

            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed border-l-4 border-primary/60 pl-4 py-1">
              {post.excerpt}
            </p>
          </header>

          {/* 2-Column Responsive Layout:
              Desktop: Left is Rich Content (col-span-7/8), Right is Sticky Slide Carousel (col-span-5/4)
              Mobile: Slide Carousel is at the TOP (order-1), Article content is below (order-2)
          */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Article Rich Technical Guide */}
            <div className="order-2 lg:order-1 lg:col-span-7 xl:col-span-8 min-w-0">
              <article className="w-full">
                {/* Content with Image Click-to-Zoom Handler */}
                <motion.div 
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="html-theme-responsive prose prose-lg dark:prose-invert max-w-none mb-12 
                    [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-foreground [&_h2]:border-b [&_h2]:border-border/40 [&_h2]:pb-2.5
                    [&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-foreground
                    [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:text-base sm:[&_p]:text-lg
                    [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:text-muted-foreground
                    [&_ol]:space-y-2 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:text-muted-foreground
                    [&_table]:w-full [&_table]:text-sm [&_table]:border-collapse [&_table]:my-6
                    [&_th]:bg-muted/60 [&_th]:p-3 [&_th]:border [&_th]:border-border [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground
                    [&_td]:p-3 [&_td]:border [&_td]:border-border/60 [&_td]:text-muted-foreground
                    [&_pre]:bg-muted/70 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border/50 [&_pre]:overflow-x-auto
                    [&_code]:text-xs [&_code]:font-mono [&_code]:bg-muted/60 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:border [&_code]:border-border/40
                    [&_.direct-answer-box]:p-6 [&_.direct-answer-box]:rounded-2xl [&_.direct-answer-box]:border [&_.direct-answer-box]:border-primary/30 [&_.direct-answer-box]:bg-primary/5 [&_.direct-answer-box]:shadow-xs [&_.direct-answer-box]:my-6
                    [&_.checklist-box]:p-6 [&_.checklist-box]:rounded-2xl [&_.checklist-box]:border [&_.checklist-box]:border-emerald-500/30 [&_.checklist-box]:bg-emerald-500/5 [&_.checklist-box]:shadow-xs [&_.checklist-box]:my-8
                    [&_.author-attribution-card]:p-6 [&_.author-attribution-card]:rounded-2xl [&_.author-attribution-card]:border [&_.author-attribution-card]:border-border/60 [&_.author-attribution-card]:bg-muted/20 [&_.author-attribution-card]:my-8
                    [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5 [&_blockquote]:p-4 [&_blockquote]:rounded-r-lg"
                  data-color-mode={resolvedTheme === 'dark' ? 'dark' : 'light'}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target && target.tagName === 'IMG') {
                      const img = target as HTMLImageElement;
                      const container = e.currentTarget;
                      const allImgs = Array.from(container.querySelectorAll('img')).map(i => normalizeMediaUrl(i.src));
                      const currentSrc = normalizeMediaUrl(img.src);
                      const currentIndex = allImgs.indexOf(currentSrc);
                      openImagePreviewModal(
                        currentSrc, 
                        img.alt || post.title, 
                        allImgs.length > 0 ? allImgs : undefined, 
                        currentIndex >= 0 ? currentIndex : 0
                      );
                    }
                  }}
                >
                  {post.content && post.content.trim().startsWith('<') && !post.content.includes('# ') && !post.content.includes('![') ? (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(post.content) }} />
                  ) : (
                    <MDEditor.Markdown 
                      source={post.content || ''} 
                      style={{ backgroundColor: 'transparent', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit' }} 
                    />
                  )}
                </motion.div>

                {/* Tags */}
                <div className="border-t border-border pt-8 mb-4">
                  <div className="flex flex-wrap gap-2">
                    {post.tags && Array.isArray(post.tags) && post.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-muted-foreground">
                        # {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </article>

              {/* Interaction & Share Bar */}
              <div className="border-t border-b border-border py-6 my-8 flex flex-wrap items-center justify-between gap-4 bg-muted/10 px-6 rounded-2xl">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleLike}
                    className={`flex items-center gap-2 rounded-full ${likeMutation.isPending ? 'opacity-50' : ''} hover:text-red-500`}
                  >
                    <Heart className={`w-4 h-4 ${post.likes ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="font-semibold">{formatCompactNumber(post.likes || 0)}</span>
                    <span className="text-xs text-muted-foreground">Suka</span>
                  </Button>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground px-3.5 py-1.5 rounded-full bg-background border border-border/50">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span>{formatCompactNumber(post.views || 0)} Dilihat</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground mr-1 flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5" />
                    Bagikan:
                  </span>
                  <Button variant="outline" size="sm" onClick={() => handleShare('twitter')}>Twitter</Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare('facebook')}>Facebook</Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare('copy')}>Salin Link</Button>
                </div>
              </div>

              {/* Author Profile */}
              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm my-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                    {profile?.aboutImage || profile?.heroImage ? (
                      <img src={normalizeMediaUrl(profile.aboutImage || profile.heroImage)} alt="Author" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-primary text-2xl">{profile?.fullName?.charAt(0) || 'E'}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground">{profile?.fullName || 'Eka Syarif Maulana, S.Kom'}</h3>
                      <Badge variant="secondary" className="text-xs font-normal">Senior Fullstack Web & Mobile Developer & AI Systems Engineer</Badge>
                    </div>
                    <p className="text-xs text-primary font-medium mb-2">Sarjana Komputer (S.Kom), Universitas Muhammadiyah Sumatera Utara</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {profile?.shortBio || profile?.bio || 'Praktisi rekayasa perangkat lunak fullstack, kecerdasan buatan, dan riset keamanan siber.'}
                    </p>
                  </div>
                </div>
              </div>

            {/* Comments Section (Di Bawah Artikel) */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm my-10">
               <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                 <MessageCircle className="w-5 h-5 text-primary" />
                 Diskusi & Komentar ({comments?.length || 0})
               </h3>
               
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                  {commentsLoading ? (
                      <div className="text-center py-4 text-muted-foreground text-xs">Memuat komentar...</div>
                  ) : comments.length > 0 ? (
                      comments.map((comment: any) => (
                          <div key={comment.id} className="flex gap-3">
                             <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                               {comment.avatar ? (
                                   <img src={comment.avatar} alt={comment.name} className="w-full h-full object-cover" />
                               ) : (
                                   <span className="text-xs font-bold">{comment.name.charAt(0).toUpperCase()}</span>
                               )}
                             </div>
                             <div className="flex-1">
                                <div className="bg-muted/30 p-3.5 rounded-xl rounded-tl-none border border-border/30">
                                   <div className="flex justify-between items-start mb-1">
                                     <p className="text-sm font-bold">{comment.name}</p>
                                     <span className="text-[10px] text-muted-foreground">
                                         {format(new Date(comment.createdAt), 'd MMM yyyy', { locale: idLocale })}
                                     </span>
                                   </div>
                                   <p className="text-xs text-muted-foreground leading-relaxed">{comment.content}</p>
                                </div>
                             </div>
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-4 text-muted-foreground text-xs">
                          Belum ada komentar. Jadilah yang pertama memberikan tanggapan!
                      </div>
                  )}
               </div>
               
               <div className="pt-6 border-t border-border">
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input 
                          placeholder="Nama Anda *" 
                          value={commentName}
                          onChange={(e) => setCommentName(e.target.value)}
                          className="text-sm"
                          required
                        />
                        <Input 
                          placeholder="Email Anda (Opsional)" 
                          type="email"
                          value={commentEmail}
                          onChange={(e) => setCommentEmail(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex gap-3">
                         <Textarea 
                            placeholder="Tulis tanggapan atau pertanyaan Anda..." 
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            className="flex-1 text-sm min-h-[90px] resize-none"
                            required
                         />
                         <Button 
                            type="submit" 
                            variant="default" 
                            className="h-[90px] px-5 flex flex-col items-center justify-center gap-1"
                            disabled={isSubmitting}
                         >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            <span className="text-xs">Kirim</span>
                         </Button>
                      </div>
                  </form>
               </div>
            </div>
            </div>

            {/* Right Column: Interactive Slide Player (Sticky on Desktop, Top Hero on Mobile) */}
            <div className="order-1 lg:order-2 lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
              <BlogSlidePlayer 
                slug={slug || ''} 
                title={post.title} 
              />

              <div className="p-4 rounded-xl border border-border/50 bg-muted/20 text-xs text-muted-foreground space-y-1.5 shadow-xs">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <span>💡 Navigasi Visual</span>
                </div>
                <p className="leading-relaxed">
                  Semua infografis 6 slide artikel ini dapat Anda zoom layar penuh dengan menekan gambar. Penjelasan teknis komprehensif, arsitektur data, dan mitigasi dapat dibaca lengkap di kolom artikel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      <GlobalModal />
      <FloatingWhatsApp />
      <ScrollToTop />
    </div>
  );
};

export default BlogDetail;
