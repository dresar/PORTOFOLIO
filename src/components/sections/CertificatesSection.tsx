import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Calendar, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCertificates } from '@/hooks/useCertificates';
import { useModalStore } from '@/store/modalStore';
import { Button } from '@/components/ui/button';
import { normalizeMediaUrl, safeUrl } from '@/lib/utils';
import { certificateCategoriesAPI } from '@/services/api';

export const CertificatesSection = () => {
  const { t } = useTranslation();
  const { openCertificateModal } = useModalStore();
  const { certificates = [], isLoading, refetch } = useCertificates();
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
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

  const { data: categories = [] } = useQuery({
    queryKey: ['certificateCategories'],
    queryFn: async () => {
      try {
        const res = await certificateCategoriesAPI.getAll();
        return res;
      } catch (error) {
        console.error('Failed to fetch categories', error);
        return [];
      }
    },
  });

  const filteredCertificates = selectedCategory === 'all'
    ? certificates
    : certificates.filter(c => c.categoryId === selectedCategory || c.category?.id === selectedCategory);

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const displayedCertificates = filteredCertificates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCategoryChange = (catId: number | 'all') => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      const section = document.getElementById('certificates');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      const section = document.getElementById('certificates');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section id="certificates" className="py-6 md:py-12 relative flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section id="certificates" className="py-6 md:py-8 relative bg-card/50 dark:bg-transparent">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-3">
            {t('nav.certificates')}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
            {t('sections.certificates.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('sections.certificates.subtitle')}
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => handleCategoryChange('all')}
            className="rounded-full"
            size="sm"
          >
            {t('common.all')}
          </Button>
          {categories.map((cat: any) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => handleCategoryChange(cat.id)}
              className="rounded-full"
              size="sm"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Certificates Static Responsive Grid */}
        <motion.div 
          layout 
          className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayedCertificates.map((cert: any) => (
              <motion.div
                key={cert.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative"
                onClick={() => openCertificateModal(cert)}
              >
                <div className="glass-strong rounded-xl overflow-hidden hover:glow-primary transition-all duration-300 cursor-pointer h-full flex flex-col dark:bg-card/50 bg-white shadow-sm hover:shadow-md border border-border/50">
                  {/* Image/Thumbnail */}
                  <div className="relative aspect-video sm:h-48 bg-muted overflow-hidden">
                    {cert.image ? (
                      <img
                        src={normalizeMediaUrl(cert.image)}
                        alt={cert.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Award className="w-8 h-8 sm:w-12 sm:h-12 text-primary/50" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-xs sm:text-base mb-1 line-clamp-1 sm:line-clamp-2 hover:text-primary transition-colors">
                      {cert.name}
                    </h3>
                    <p className="text-[11px] sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-1">{cert.issuer}</p>
                    
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                        <span className="truncate">{new Date(cert.issueDate).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</span>
                      </div>
                      
                      {cert.credentialUrl && (
                        <a
                          href={safeUrl(cert.credentialUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hidden sm:flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {t('certificates.verify')}
                        </a>
                      )}
                    </div>

                    {/* Action Button on Card Bottom */}
                    <div className="pt-2 sm:pt-3 border-t border-border/40 mt-auto">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openCertificateModal(cert);
                        }}
                        className="relative group/btn overflow-hidden rounded-lg sm:rounded-xl p-[1.5px] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-sm hover:shadow-primary/30 cursor-pointer w-full"
                      >
                        <span 
                          className="absolute inset-[-1000%] animate-[spin_3.5s_linear_infinite]"
                          style={{
                            background: 'conic-gradient(from 90deg at 50% 50%, #0000 0%, #38bdf8 50%, #818cf8 75%, #0000 100%)',
                          }}
                        />
                        
                        <span className="relative flex items-center justify-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded-[7px] sm:rounded-[10px] bg-card text-[10px] sm:text-xs font-bold text-foreground group-hover/btn:text-primary transition-colors w-full">
                          <span>{t('certificates.view')}</span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Pagination Controls */}
        {!isMobile && totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-12">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                currentPage === 1
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {t('common.previous')}
            </button>
            <span className="flex items-center text-muted-foreground text-sm">
              {t('common.page_info', { current: currentPage, total: totalPages })}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                currentPage === totalPages
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {filteredCertificates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No certificates found in this category.
          </div>
        )}
      </div>
    </section>
  );
};