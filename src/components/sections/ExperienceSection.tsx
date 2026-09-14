import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin, Building2, ArrowRight, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useExperience } from '@/hooks/useExperience';
import { normalizeMediaUrl } from '@/lib/utils';
import { useModalStore } from '@/store/modalStore';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';
import { MediaThumbnail } from '@/components/ui/VideoThumbnail';

export const ExperienceSection = () => {
  const { t } = useTranslation();
  const { experiences: rawExperiences = [], isLoading } = useExperience();
  const { getExperiences } = useLocalizedContent();
  const experiences = getExperiences(rawExperiences);
  const { openExperienceDetailModal, openImagePreviewModal } = useModalStore();

  if (isLoading) {
    return (
      <section id="experience" className="py-6 md:py-8 relative bg-card/30">
        <div className="container mx-auto px-3 max-w-7xl">
          <div className="text-center mb-6">
            <Skeleton className="h-8 w-44 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/30 p-3.5 space-y-3 bg-card/40">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = t('common.present') === 'Sekarang' ? 'id-ID' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
  };

  const stripHtml = (htmlString?: string) => {
    if (!htmlString) return '';
    return htmlString.replace(/<[^>]*>?/gm, '');
  };

  const renderExperienceCard = (exp: any) => {
    let gallery: any[] = [];
    if (exp.gallery) {
      if (Array.isArray(exp.gallery)) {
        gallery = exp.gallery;
      } else if (typeof exp.gallery === 'string') {
        try {
          if (exp.gallery.startsWith('[')) {
            gallery = JSON.parse(exp.gallery);
          } else if (exp.gallery.trim()) {
            gallery = [exp.gallery];
          }
        } catch {
          gallery = [];
        }
      }
    }

    const firstGalleryImage = gallery.find((item: any) => {
      const u = typeof item === 'string' ? item : item?.url;
      return u && !/\.(mp4|webm|mov|mkv|avi)($|\?)/i.test(u);
    });

    const firstImageStr = firstGalleryImage 
      ? (typeof firstGalleryImage === 'string' ? firstGalleryImage : firstGalleryImage?.url) 
      : (gallery[0] ? (typeof gallery[0] === 'string' ? gallery[0] : gallery[0]?.url) : null);

    const coverUrl = exp.coverImage || exp.cover_image || exp.banner || firstImageStr || exp.image;
    const logoUrl = exp.image || exp.logo || exp.companyLogo;

    const galleryUrls = gallery.map((item: any) => {
      const u = typeof item === 'string' ? item : item?.url;
      return u ? normalizeMediaUrl(u) : null;
    }).filter(Boolean);

    const previewList = galleryUrls.length > 0 ? galleryUrls : (coverUrl ? [normalizeMediaUrl(coverUrl)] : []);
    const initialIdx = coverUrl ? Math.max(0, previewList.indexOf(normalizeMediaUrl(coverUrl))) : 0;

    return (
      <div 
        className="glass-strong rounded-xl sm:rounded-2xl overflow-hidden hover:glow-primary transition-all duration-300 h-full flex flex-col border border-border/50 dark:bg-card/50 bg-white shadow-sm hover:shadow-md cursor-pointer group"
        onClick={() => openExperienceDetailModal(exp)}
      >
        <div className="relative shrink-0">
          <div 
            className="relative aspect-video overflow-hidden bg-muted flex items-center justify-center cursor-zoom-in group/img"
            onClick={(e) => {
              if (coverUrl) {
                e.stopPropagation();
                openImagePreviewModal(
                  normalizeMediaUrl(coverUrl), 
                  `${exp.role} - ${exp.company}`,
                  previewList,
                  initialIdx !== -1 ? initialIdx : 0
                );
              }
            }}
            title="Sentuh untuk memperbesar foto bukti"
          >
            {coverUrl ? (
              <MediaThumbnail 
                src={coverUrl} 
                alt={exp.company} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" 
                videoBadgePosition="top-right"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-primary/30" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
              <div className="size-6 sm:size-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-md">
                <Maximize2 className="size-3 sm:size-3.5" />
              </div>
            </div>
          </div>

          {logoUrl && (
            <div className="absolute -bottom-3 sm:-bottom-3.5 left-2.5 sm:left-3.5 size-6 sm:size-8 rounded-md sm:rounded-lg border-2 border-background bg-white p-0.5 sm:p-1 shadow-sm flex items-center justify-center z-10">
              <img 
                src={normalizeMediaUrl(logoUrl)} 
                alt={`${exp.company} logo`} 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        <div className="pt-4 sm:pt-4.5 px-2.5 sm:px-3.5 pb-2.5 sm:pb-3 flex flex-col flex-1">
          <div className="mb-1 sm:mb-1.5">
            <h3 className="text-xs sm:text-sm md:text-base font-heading font-bold mb-0.5 leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {exp.role}
            </h3>
            <div className="text-primary font-medium text-[10px] sm:text-xs flex items-center gap-1">
              <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span className="line-clamp-1">{exp.company}</span>
            </div>
          </div>

          <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-2.5 flex-1">
            <p className="text-muted-foreground text-[10px] sm:text-xs line-clamp-2 leading-relaxed">
              {stripHtml(exp.description)}
            </p>

            <div className="flex flex-wrap gap-1 text-[9px] sm:text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded text-[9px] sm:text-[11px]">
                <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                <span className="truncate">{formatDate(exp.startDate)} - {exp.isCurrent ? t('common.present') : (exp.endDate ? formatDate(exp.endDate) : t('common.present'))}</span>
              </div>
              {exp.location && (
                <div className="hidden sm:flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded text-[9px] sm:text-[11px]">
                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                  <span className="truncate">{exp.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 sm:pt-2.5 border-t border-border/40 mt-auto">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openExperienceDetailModal(exp);
              }}
              className="w-full inline-flex h-7 sm:h-8 items-center justify-center gap-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-[10px] sm:text-xs font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer group/btn"
            >
              <span>{t('common.details')}</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="experience" className="py-6 md:py-8 relative bg-card/30">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
            {t('sections.experience.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm">
            {t('sections.experience.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
          {experiences.map((exp: any, index: number) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              {renderExperienceCard(exp)}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
