import { useEffect, useLayoutEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBlogPostBySlug } from '@/hooks/useBlog';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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
                  "jobTitle": "Founder Inka.tech | Senior Fullstack Developer & AI Engineer",
                  "url": "https://etech.my.id"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Inka.tech",
                  "url": "https://etech.my.id"
                },
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": typeof window !== 'undefined' ? window.location.href : `https://etech.my.id/id/blog/${slug}`
                }
              })}
            </script>
          </Helmet>

          <div className="mb-8">
            <Link 
              to={getLocalizedPath('/blog')} 
              className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('blog.back_to_blog')}
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Main Article Content - Full Width */}
            <article className="w-full">
              {/* Header */}
              <header className="mb-8">
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-sm font-medium">
                        {post.category?.name || t('blog.default_category')}
                    </Badge>
                    <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {format(new Date(post.published_at || post.created_at), 'd MMMM yyyy', { locale: idLocale })}
                    </span>
                    <span className="flex items-center text-foreground font-medium">
                        <User className="w-4 h-4 mr-1.5 text-primary" />
                        Eka Syarif Maulana
                    </span>
                    <span className="flex items-center font-medium text-primary">
                        <Eye className="w-4 h-4 mr-1.5" />
                        {formatCompactNumber(post.views || 0)} views
                    </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                    {post.title}
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary/50 pl-4">
                    {post.excerpt}
                </p>
              </header>

              {/* Featured Image - Compact & Click to Zoom */}
              {(post.coverImageFile || post.coverImage) ? (
                <div className="flex justify-center mb-10">
                  <div 
                    className="rounded-xl overflow-hidden shadow-md cursor-zoom-in group relative max-w-[420px] w-full border border-border/50 bg-muted/20 hover:shadow-xl transition-all"
                    onClick={() => openImagePreviewModal(normalizeMediaUrl(post.coverImageFile || post.coverImage), post.title)}
                  >
                    <img 
                        src={normalizeMediaUrl(post.coverImageFile || post.coverImage)} 
                        alt={post.title} 
                        className="w-full max-h-[440px] object-contain group-hover:scale-[1.01] transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://placehold.co/1200x600?text=Blog+Post";
                        }}
                    />
                    <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-[11px] px-2 py-1 rounded-md text-muted-foreground border border-border/40 pointer-events-none flex items-center gap-1">
                      <span>🔍 Klik untuk Zoom</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Content with Image Click-to-Zoom Handler */}
              <div 
                className="html-theme-responsive prose prose-lg dark:prose-invert max-w-none mb-12 [&_.overflow-hidden]:max-w-[360px] sm:[&_.overflow-hidden]:max-w-[400px] md:[&_.overflow-hidden]:max-w-[440px] [&_.overflow-hidden]:mx-auto [&_.overflow-hidden]:my-6 [&_img]:max-w-[340px] sm:[&_img]:max-w-[380px] md:[&_img]:max-w-[420px] [&_img]:max-h-[480px] [&_img]:w-auto [&_img]:h-auto [&_img]:object-contain [&_img]:mx-auto [&_img]:rounded-xl [&_img]:shadow-md [&_img]:border [&_img]:border-border/50 [&_img]:my-6 [&_img]:block [&_img]:cursor-zoom-in hover:[&_img]:scale-[1.01] hover:[&_img]:shadow-xl [&_img]:transition-all [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5 [&_blockquote]:p-4 [&_blockquote]:rounded-r-lg"
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
              </div>

              {/* Tags */}
              <div className="border-t pt-8 mb-4">
                 <div className="flex flex-wrap gap-2">
                     {post.tags && Array.isArray(post.tags) && post.tags.map((tag: string, i: number) => (
                         <Badge key={i} variant="outline" className="text-muted-foreground">
                             # {tag}
                         </Badge>
                     ))}
                 </div>
              </div>
            </article>

            {/* Interaction & Share Bar (Di Bawah Artikel) */}
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

            {/* Author Profile (Di Bawah Artikel) */}
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
                      <Badge variant="secondary" className="text-xs font-normal">Founder Inka.tech</Badge>
                    </div>
                    <p className="text-xs text-primary font-medium mb-2">{profile?.role && JSON.parse(profile.role)[0] || 'Senior Fullstack Developer & AI Engineer'}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {profile?.shortBio || profile?.bio || 'Suka berbagi pengalaman seputar teknologi, coding, arsitektur AI, dan edukasi keamanan siber.'}
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
