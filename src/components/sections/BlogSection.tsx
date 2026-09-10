import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlogPosts } from '@/hooks/useBlog';
import { normalizeMediaUrl } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLocalizedPath } from '@/lib/i18nNavigation';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';

export const BlogSection = () => {
  const { t } = useTranslation();
  const { posts: rawPosts, isLoading } = useBlogPosts();
  const { getBlogPosts } = useLocalizedContent();
  const posts = getBlogPosts(rawPosts);
  const navigate = useNavigate();

  // Filter only published posts and take first 8
  const latestPosts = posts
    .filter((post: any) => post.is_published !== false)
    .slice(0, 8);

  if (isLoading) {
    return (
      <section id="blog" className="py-6 md:py-12 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-6 md:py-8 relative overflow-hidden bg-secondary/5">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            {t('blog.latest_title')}
          </h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-primary to-purple-500 mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            {t('blog.subtitle')}
          </p>
        </motion.div>

        {latestPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{t('blog.no_posts')}</p>
          </div>
        ) : (
          /* Static Responsive Grid (2 Columns on Mobile, 4 Columns on Desktop) */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {latestPosts.map((post: any, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="group rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 bg-card border border-border/50 h-full flex flex-col hover:border-primary/50 hover:-translate-y-0.5"
              >
                {/* 3:4 Portrait Image */}
                <div className="relative aspect-[3/4] overflow-hidden shrink-0 bg-muted/20">
                  <Link to={getLocalizedPath(`/blog/${post.slug}`)} className="block h-full">
                    <img
                      src={normalizeMediaUrl(post.cover_image || post.coverImage || post.coverImageFile || "https://placehold.co/600x400?text=Blog+Post")}
                      alt={post.title}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/600x400?text=Blog+Post";
                      }}
                    />
                  </Link>
                </div>

                {/* Minimalist Title & Date */}
                <div className="p-2.5 sm:p-3.5 flex flex-col flex-grow justify-between gap-1.5">
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3 shrink-0 text-primary/70" />
                    <span>{format(new Date(post.published_at || post.created_at), 'd MMM yyyy', { locale: id })}</span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                    <Link to={getLocalizedPath(`/blog/${post.slug}`)} className="focus:outline-none">
                      {post.title}
                    </Link>
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 sm:mt-12 text-center">
          <Button 
            onClick={() => navigate(getLocalizedPath('/blog'))}
            size="lg"
            variant="outline"
            className="group text-xs sm:text-sm px-4 py-2 sm:px-6 sm:py-3"
          >
            {t('blog.view_all')}
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};
