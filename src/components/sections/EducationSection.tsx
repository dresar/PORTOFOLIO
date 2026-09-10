import { motion } from 'framer-motion';
import { GraduationCap, Calendar, Award, Image as ImageIcon, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEducation } from '@/hooks/useEducation';
import { useModalStore } from '@/store/modalStore';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';

export const EducationSection = () => {
  const { t } = useTranslation();
  const { openEducationDetailModal } = useModalStore();
  const { education: rawEducation = [], isLoading } = useEducation();
  const { getEducations } = useLocalizedContent();
  const education = getEducations(rawEducation);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (String(dateString).toLowerCase() === 'sekarang' || String(dateString).toLowerCase() === 'present') return t('common.present');
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const locale = t('common.present') === 'Sekarang' ? 'id-ID' : 'en-US';

        return date.toLocaleDateString(locale, { 
            year: 'numeric', 
            month: 'short' 
        });
    } catch {
        return dateString;
    }
  };

  const renderEducationCard = (edu: any) => {
    const gallery = edu.gallery 
      ? (typeof edu.gallery === 'string' ? JSON.parse(edu.gallery) : edu.gallery)
      : [];
    const firstGalleryImage = gallery.length > 0 ? gallery[0] : null;
    const coverUrl = edu.coverImage || edu.cover_image || edu.cover_image_url || firstGalleryImage;

    return (
      <>
        <div className="relative shrink-0">
          <div className="relative aspect-video overflow-hidden bg-muted flex items-center justify-center">
            {coverUrl ? (
              <img 
                src={coverUrl} 
                alt={edu.institution} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <GraduationCap className="w-8 h-8 sm:w-12 sm:h-12 text-primary/30" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {(edu.logo || edu.logo_url) && (
            <div className="absolute -bottom-4 sm:-bottom-6 left-3 sm:left-5 w-9 h-9 sm:w-14 sm:h-14 rounded-full border-2 sm:border-4 border-background bg-white flex items-center justify-center z-10 overflow-hidden shadow-md">
              <img 
                src={edu.logo || edu.logo_url} 
                alt={`${edu.institution} logo`} 
                className="w-full h-full object-contain rounded-full p-0.5"
              />
            </div>
          )}
        </div>
        
        <div className="pt-5 sm:pt-8 px-2.5 sm:px-5 pb-3 sm:pb-5 flex flex-col flex-1">
          <div className="mb-2 sm:mb-3">
            <h3 className="text-xs sm:text-lg font-heading font-bold mb-0.5 sm:mb-1 leading-snug line-clamp-1 group-hover:text-primary transition-colors">{edu.institution}</h3>
            <p className="text-primary text-[11px] sm:text-sm font-medium line-clamp-1">{edu.degree}</p>
          </div>

          <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 flex-1">
             <p className="text-muted-foreground text-[10px] sm:text-xs line-clamp-1 sm:line-clamp-2">{edu.field}</p>
             
             <div className="flex flex-wrap gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                <div className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-[10px] sm:text-xs">
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="truncate">{formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : t('common.present')}</span>
                </div>
                {edu.gpa && (
                  <div className="hidden sm:flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md text-primary font-medium">
                    <Award className="w-3.5 h-3.5" />
                    {t('education.gpa')} {edu.gpa}
                  </div>
                )}
             </div>
          </div>

          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border/50 mt-auto">
            <div className="flex gap-1">
              {edu.gallery && (typeof edu.gallery === 'string' ? JSON.parse(edu.gallery).length > 0 : edu.gallery.length > 0) && (
                  <div className="text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 bg-primary/10 text-primary rounded-md flex items-center gap-1 font-medium">
                      <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">{t('education.gallery')}</span>
                  </div>
              )}
            </div>
            
            <button 
              onClick={(e) => {
                  e.stopPropagation();
                  openEducationDetailModal(edu);
              }}
              className="relative group/btn overflow-hidden rounded-lg sm:rounded-xl p-[1.5px] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-sm hover:shadow-primary/30 cursor-pointer ml-auto"
            >
              <span 
                className="absolute inset-[-1000%] animate-[spin_3.5s_linear_infinite]"
                style={{
                  background: 'conic-gradient(from 90deg at 50% 50%, #0000 0%, #38bdf8 50%, #818cf8 75%, #0000 100%)',
                }}
              />
              
              <span className="relative flex items-center justify-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-[7px] sm:rounded-[10px] bg-card text-[10px] sm:text-xs font-semibold text-foreground group-hover/btn:text-primary transition-colors">
                <span>{t('common.details')}</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary transition-transform duration-300 group-hover/btn:translate-x-1" />
              </span>
            </button>
          </div>
        </div>
      </>
    );
  };

  if (isLoading) {
    return (
      <section id="education" className="py-6 md:py-12 relative flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section id="education" className="py-6 md:py-8 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
            {t('sections.education.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            {t('sections.education.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {education.map((edu: any, index: number) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <div 
                className="glass-strong rounded-xl sm:rounded-2xl overflow-hidden hover:glow-primary transition-all duration-300 h-full flex flex-col border border-border/50 dark:bg-card/50 bg-white shadow-sm hover:shadow-md cursor-pointer group"
                onClick={() => openEducationDetailModal(edu)}
              >
                {renderEducationCard(edu)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
