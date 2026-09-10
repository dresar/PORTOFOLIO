import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlogPosts } from '@/hooks/useBlog';
import { normalizeMediaUrl } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const BlogSection = () => {
  const { t } = useTranslation();
  const { posts, isLoading } = useBlogPosts();
  const navigate = useNavigate();

  // Filter only published posts and take first 8
  const latestPosts = posts
    .filter((post: any) => post.is_published)
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {latestPosts.map((post: any, index: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="neon-card group rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card border border-border/50 h-full flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden shrink-0">
                  <Link to={`/blog/${post.slug}`} className="block h-full">
                    <img
                      src={post.coverImage || post.coverImageFile ? normalizeMediaUrl(post.coverImage || post.coverImageFile) : "https://placehold.co/600x400?text=Blog+Post"}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/600x400?text=Blog+Post";
                      }}
                    />
                  </Link>
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                    <span className="bg-primary/90 text-primary-foreground text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full backdrop-blur-sm truncate max-w-[100px] sm:max-w-none inline-block">
                      {post.category?.name || t('blog.default_category')}
                    </span>
                  </div>
                </div>

                <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-3">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      <span>{format(new Date(post.created_at), 'd MMM yyyy', { locale: id })}</span>
                    </div>

                    <h3 className="text-xs sm:text-lg font-bold mb-1.5 leading-snug sm:leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      <Link to={`/blog/${post.slug}`} className="focus:outline-none">
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mb-3 hidden sm:block">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-2 sm:pt-3 border-t border-border/40 mt-auto flex justify-end">
                    <Link to={`/blog/${post.slug}`} className="block w-full sm:w-auto">
                      <span className="relative group/btn overflow-hidden rounded-lg sm:rounded-xl p-[1.5px] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-sm hover:shadow-primary/30 cursor-pointer block text-center">
                        <span 
                          className="absolute inset-[-1000%] animate-[spin_3.5s_linear_infinite]"
                          style={{
                            background: 'conic-gradient(from 90deg at 50% 50%, #0000 0%, #38bdf8 50%, #818cf8 75%, #0000 100%)',
                          }}
                        />
                        <span className="relative flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-[7px] sm:rounded-[10px] bg-card text-[10px] sm:text-xs font-semibold text-foreground group-hover/btn:text-primary transition-colors">
                          <span>{t('blog.read_more') || 'Selengkapnya'}</span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 sm:mt-12 text-center">
          <Button 
            onClick={() => navigate('/blog')}
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
