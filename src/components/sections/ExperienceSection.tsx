import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin, Building2, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useExperience } from '@/hooks/useExperience';
import { normalizeMediaUrl } from '@/lib/utils';
import { useModalStore } from '@/store/modalStore';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';

export const ExperienceSection = () => {
  const { t } = useTranslation();
  const { experiences: rawExperiences = [], isLoading } = useExperience();
  const { getExperiences } = useLocalizedContent();
  const experiences = getExperiences(rawExperiences);
  const { openExperienceDetailModal } = useModalStore();

  if (isLoading) {
    return (
      <section id="experience" className="py-6 md:py-8 relative bg-card/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-6">
            <Skeleton className="h-8 w-44 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/30 p-5 space-y-3 bg-card/40">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
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

    return (
      <div 
        className="glass-strong rounded-xl sm:rounded-2xl overflow-hidden hover:glow-primary transition-all duration-300 h-full flex flex-col border border-border/50 dark:bg-card/50 bg-white shadow-sm hover:shadow-md cursor-pointer group"
        onClick={() => openExperienceDetailModal(exp)}
      >
        <div className="relative shrink-0 w-full aspect-[16/8] sm:aspect-[16/7] overflow-hidden bg-muted flex items-center justify-center">
          {coverUrl ? (
            <img 
              src={normalizeMediaUrl(coverUrl)} 
              alt={exp.company} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/15 to-primary/5 flex items-center justify-center">
              <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-primary/30" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 flex items-center gap-1.5">
            {gallery.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white border border-white/10 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-primary" />
                <span>Bukti ({gallery.length})</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
              {exp.isCurrent ? '● Aktif' : 'Selesai'}
            </span>
          </div>

          {logoUrl && (
            <div className="absolute -bottom-3 sm:-bottom-4 left-3 sm:left-4 w-9 h-9 sm:w-11 sm:h-11 rounded-xl border-2 border-background bg-white p-1 shadow-md flex items-center justify-center overflow-hidden z-10">
              <img 
                src={normalizeMediaUrl(logoUrl)} 
                alt={`${exp.company} logo`} 
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        <div className="pt-4 sm:pt-5 px-3 sm:px-5 pb-3 sm:pb-4 flex flex-col flex-1">
          <div className="mb-2">
            <h3 className="text-sm sm:text-base font-heading font-bold mb-0.5 leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {exp.role}
            </h3>
            <div className="text-primary font-medium text-xs flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{exp.company}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-2.5">
            <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>{formatDate(exp.startDate)} - {exp.isCurrent ? t('common.present') : (exp.endDate ? formatDate(exp.endDate) : t('common.present'))}</span>
            </div>
            {exp.location && (
              <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{exp.location}</span>
              </div>
            )}
          </div>

          <div className="flex-1 mb-2.5">
            <p className="text-muted-foreground text-[11px] sm:text-xs leading-relaxed line-clamp-2">
              {stripHtml(exp.description)}
            </p>
          </div>

          <div className="pt-2 sm:pt-2.5 border-t border-border/40 mt-auto">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openExperienceDetailModal(exp);
              }}
              className="w-full inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer group"
            >
              <span>{t('common.details')}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="experience" className="py-6 md:py-8 relative bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
            {t('sections.experience.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('sections.experience.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
