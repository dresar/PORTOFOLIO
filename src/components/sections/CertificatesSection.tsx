import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Calendar, ExternalLink, Loader2, ArrowRight, FileText, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useCertificates } from '@/hooks/useCertificates';
import { useModalStore } from '@/store/modalStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { normalizeMediaUrl, safeUrl } from '@/lib/utils';
import { certificateCategoriesAPI } from '@/services/api';
import { useLocalizedContent } from '@/hooks/useLocalizedContent';

export const CertificatesSection = () => {
  const { t } = useTranslation();
  const { openCertificateModal } = useModalStore();
  const { certificates: rawCertificates = [], isLoading, refetch } = useCertificates();
  const { getCertificates } = useLocalizedContent();
  const certificates = getCertificates(rawCertificates);
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
      <section id="certificates" className="py-6 md:py-8 relative bg-card/50 dark:bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <Skeleton className="h-8 w-44 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/30 p-4 space-y-3 bg-card/40">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3">
            {t('sections.certificates.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('sections.certificates.subtitle')}
          </p>
        </motion.div>

        <div className="sm:hidden w-full max-w-[260px] mx-auto mb-6">
          <Select 
            value={String(selectedCategory)} 
            onValueChange={(val) => handleCategoryChange(val === 'all' ? 'all' : Number(val))}
          >
            <SelectTrigger aria-label="Filter kategori sertifikat" className="h-9 w-full rounded-lg border-border/70 bg-card/90 backdrop-blur text-xs font-medium shadow-sm hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <Filter className="w-3.5 h-3.5 text-primary shrink-0" />
                <SelectValue placeholder={t('common.all')} />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/70 bg-popover/95 backdrop-blur-xl z-50 max-h-64 shadow-xl">
              <SelectItem value="all" className="text-xs py-2 cursor-pointer font-medium">
                {t('common.all')}
              </SelectItem>
              {categories.map((cat: any) => (
                <SelectItem 
                  key={cat.id} 
                  value={String(cat.id)}
                  className="text-xs py-2 cursor-pointer font-medium"
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="hidden sm:flex flex-wrap justify-center gap-1.5 md:gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => handleCategoryChange('all')}
            className="rounded-lg h-8 px-3 text-xs font-medium cursor-pointer"
            size="sm"
          >
            {t('common.all')}
          </Button>
          {categories.map((cat: any) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => handleCategoryChange(cat.id)}
              className="rounded-lg h-8 px-3 text-xs font-medium cursor-pointer"
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
                    {cert.image && !/\.pdf($|\?)/i.test(cert.image) ? (
                      <img
                        src={normalizeMediaUrl(cert.image, { width: 450 })}
                        alt={cert.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (cert.pdfUrl || (cert.image && /\.pdf($|\?)/i.test(cert.image))) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-red-500/10 text-red-500 gap-2 p-3 text-center">
                        <FileText className="w-8 h-8 sm:w-10 sm:h-10" />
                        <span className="text-[11px] font-semibold">Dokumen PDF (Multi-Halaman)</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Award className="w-8 h-8 sm:w-12 sm:h-12 text-primary/50" />
                      </div>
                    )}

                    {(cert.pdfUrl || (cert.image && /\.pdf($|\?)/i.test(cert.image))) && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-red-500/90 text-white text-[10px] font-bold tracking-wider flex items-center gap-1 shadow-md">
                        <FileText className="size-3" />
                        <span>PDF</span>
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
                          aria-label={`Verifikasi kredensial sertifikat ${cert.name}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {t('certificates.verify')}
                        </a>
                      )}
                    </div>

                    {/* Action Button on Card Bottom */}
                    <div className="pt-2 sm:pt-2.5 border-t border-border/40 mt-auto">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCertificateModal(cert);
                        }}
                        className="w-full inline-flex h-8 sm:h-9 items-center justify-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 text-[11px] sm:text-xs font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer group"
                      >
                        <span>{t('certificates.view')}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/70 bg-card hover:bg-muted active:scale-[0.96] transition-transform cursor-pointer"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              aria-label={t('common.previous')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-center px-3 h-8 rounded-lg bg-muted/60 border border-border/50 text-xs font-medium select-none">
              <span className="text-foreground font-semibold">{currentPage}</span>
              <span className="mx-1 text-muted-foreground">/</span>
              <span className="text-muted-foreground">{totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/70 bg-card hover:bg-muted active:scale-[0.96] transition-transform cursor-pointer"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              aria-label={t('common.next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {filteredCertificates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {t('certificates.no_certificates')}
          </div>
        )}
      </div>
    </section>
  );
};