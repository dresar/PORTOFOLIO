import { motion } from 'framer-motion';
import { Briefcase, Calendar, MapPin, Building2, Loader2, Eye, ArrowRight, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useExperience } from '@/hooks/useExperience';
import { normalizeMediaUrl } from '@/lib/utils';
import { useModalStore } from '@/store/modalStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useRef } from 'react';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';

export const ExperienceSection = () => {
  const { t } = useTranslation();
  const { experiences: rawExperiences = [], isLoading } = useExperience();
  const { getExperiences } = useLocalizedContent();
  const experiences = getExperiences(rawExperiences);
  const { openExperienceGalleryModal, openExperienceDetailModal } = useModalStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  return (
    <section id="experience" className="py-6 md:py-8 relative bg-card/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
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

        {/* Experience Static Grid */}
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
              <div 
                className="glass-strong rounded-2xl p-4 sm:p-6 hover:glow-primary transition-all duration-300 h-full flex flex-col border border-border/50 dark:bg-card/50 bg-white shadow-sm hover:shadow-md cursor-pointer group"
                onClick={() => openExperienceDetailModal(exp)}
              >
                {/* Header */}
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="shrink-0">
                    {exp.image ? (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-white border border-border">
                        <img 
                          src={normalizeMediaUrl(exp.image)} 
                          alt={exp.company} 
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10">
                        <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <h3 className="text-base sm:text-xl font-heading font-bold mb-0.5 sm:mb-1 leading-tight line-clamp-2 group-hover:text-primary transition-colors">{exp.role}</h3>
                      <div className="text-primary font-medium text-xs sm:text-sm flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{exp.company}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(exp.startDate)} - {exp.isCurrent ? t('common.present') : (exp.endDate ? formatDate(exp.endDate) : t('common.present'))}
                  </div>
                  {exp.location && (
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                      <MapPin className="w-3.5 h-3.5" />
                      {exp.location}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="flex-1 mb-3 sm:mb-4">
                  <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3 leading-relaxed">
                    {stripHtml(exp.description)}
                  </p>
                </div>

                {/* Action Footer Button */}
                <div className="pt-3 border-t border-border/40 mt-auto flex items-center justify-between">
                  <span className="text-xs text-muted-foreground/80 font-medium">
                    {exp.isCurrent ? '● Aktif' : 'Selesai'}
                  </span>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openExperienceDetailModal(exp);
                    }}
                    className="relative group/btn overflow-hidden rounded-xl p-[1.5px] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-md hover:shadow-primary/30 cursor-pointer"
                  >
                    <span 
                      className="absolute inset-[-1000%] animate-[spin_3.5s_linear_infinite]"
                      style={{
                        background: 'conic-gradient(from 90deg at 50% 50%, #0000 0%, #38bdf8 50%, #818cf8 75%, #0000 100%)',
                      }}
                    />
                    
                    <span className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-card/90 backdrop-blur-md text-xs font-semibold text-foreground group-hover/btn:text-primary transition-colors">
                      <span>Detail</span>
                      <ArrowRight className="w-3.5 h-3.5 text-primary transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
