import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  Play, 
  Pause, 
  Layers, 
  Expand, 
  Check, 
  Maximize2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useModalStore } from '@/store/modalStore';
import { normalizeMediaUrl } from '@/lib/utils';

interface BlogSlidePlayerProps {
  slug: string;
  title: string;
  totalSlides?: number;
  customSlides?: string[];
  className?: string;
}

export const BlogSlidePlayer: React.FC<BlogSlidePlayerProps> = ({
  slug,
  title,
  totalSlides = 6,
  customSlides,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { openImagePreviewModal } = useModalStore();

  // Generate slide URLs
  const slideUrls: string[] = React.useMemo(() => {
    if (customSlides && customSlides.length > 0) {
      return customSlides;
    }
    const urls: string[] = [];
    for (let i = 1; i <= totalSlides; i++) {
      const pad = String(i).padStart(2, '0');
      urls.push(`https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_${pad}.png`);
    }
    return urls;
  }, [slug, totalSlides, customSlides]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slideUrls.length);
  }, [slideUrls.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slideUrls.length) % slideUrls.length);
  }, [slideUrls.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Autoplay Slideshow
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  // Keyboard navigation when hovered
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const currentUrl = slideUrls[currentIndex] || slideUrls[0];

  const handleOpenZoom = () => {
    openImagePreviewModal(
      currentUrl,
      `${title} - Slide ${currentIndex + 1} dari ${slideUrls.length}`,
      slideUrls,
      currentIndex
    );
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.28, ease: 'easeOut' },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.2, ease: 'easeIn' },
    }),
  };

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      className={`rounded-2xl border border-border/70 bg-card/90 backdrop-blur-md p-4 sm:p-5 shadow-lg relative flex flex-col focus:outline-hidden focus:ring-2 focus:ring-primary/40 ${className}`}
      aria-label="Slide Visual Player"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/40 bg-primary/5 text-primary flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Slide Carousel</span>
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            {currentIndex + 1} / {slideUrls.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Jeda otomatis' : 'Putar otomatis'}
            aria-label={isPlaying ? 'Jeda otomatis' : 'Putar otomatis'}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-primary animate-pulse" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={handleOpenZoom}
            title="Perbesar Layar Penuh"
            aria-label="Perbesar Layar Penuh"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Screen */}
      <div 
        className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-muted/30 border border-border/60 shadow-inner group cursor-zoom-in"
        onClick={handleOpenZoom}
      >
        <AnimatePresence custom={direction} mode="wait">
          {imageErrors[currentUrl] ? (
            <motion.div
              key={`fallback-${currentIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-card to-muted/40 select-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3 shadow-xs">
                <Layers className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="text-[11px] mb-2 px-2.5 py-0.5">
                Slide {currentIndex + 1} of {slideUrls.length}
              </Badge>
              <h4 className="text-sm font-bold text-foreground line-clamp-2 mb-1 px-2">
                {title}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-2">
                Infografis Edukasi Digital
              </p>
            </motion.div>
          ) : (
            <motion.img
              key={currentUrl}
              src={currentUrl}
              alt={`${title} - Slide ${currentIndex + 1}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full object-contain select-none"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const pad = String(currentIndex + 1).padStart(2, '0');
                const cdn = `https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_${pad}.png`;
                if (target.src !== cdn) {
                  target.src = cdn;
                } else {
                  setImageErrors((prev) => ({ ...prev, [currentUrl]: true }));
                }
              }}
            />
          )}
        </AnimatePresence>

        {/* Hover Hint Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="bg-background/90 backdrop-blur-md text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-border/50 flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <ZoomIn className="w-3.5 h-3.5 text-primary" />
            <span>Klik untuk Zoom HD</span>
          </div>
        </div>

        {/* Floating Prev / Next Buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/85 backdrop-blur-md text-foreground border border-border/50 shadow-md flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 transition-all z-10"
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/85 backdrop-blur-md text-foreground border border-border/50 shadow-md flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 transition-all z-10"
          aria-label="Slide selanjutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Slide Badge */}
        <div className="absolute bottom-2.5 left-2.5 bg-background/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-foreground/80 border border-border/40 pointer-events-none shadow-xs">
          Slide {currentIndex + 1} of {slideUrls.length}
        </div>
      </div>

      {/* Thumbnails Navigation */}
      <div className="mt-3.5 grid grid-cols-6 gap-1.5 sm:gap-2">
        {slideUrls.map((url, idx) => (
          <button
            key={url}
            onClick={() => goToSlide(idx)}
            className={`relative aspect-[3/4] rounded-lg overflow-hidden border transition-all duration-200 group ${
              idx === currentIndex
                ? 'border-primary ring-2 ring-primary/40 shadow-sm scale-102'
                : 'border-border/60 opacity-60 hover:opacity-100 hover:border-foreground/30'
            }`}
            aria-label={`Pilih slide ${idx + 1}`}
          >
            <img 
              src={url} 
              alt={`Thumb ${idx + 1}`} 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const pad = String(idx + 1).padStart(2, '0');
                const cdn = `https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/uploads/articles/${slug}/${slug}_${pad}.png`;
                if (target.src !== cdn) {
                  target.src = cdn;
                }
              }}
            />
            <div className={`absolute inset-0 transition-colors flex items-center justify-center ${
              idx === currentIndex ? 'bg-primary/10' : 'bg-black/10 group-hover:bg-transparent'
            }`}>
              <span className={`text-[10px] font-bold px-1 rounded shadow-xs ${
                idx === currentIndex ? 'bg-primary text-primary-foreground' : 'bg-background/80 text-foreground'
              }`}>
                {idx + 1}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Helpful Hint */}
      <div className="mt-3 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
        <span>💡 Geser atau klik slide untuk inspeksi detail grafis edukasi</span>
      </div>
    </div>
  );
};
