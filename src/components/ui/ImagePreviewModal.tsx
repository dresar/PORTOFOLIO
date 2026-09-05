import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useModalStore } from '@/store/modalStore';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { normalizeMediaUrl } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

export const ImagePreviewModal = () => {
  const { isOpen, modalType, imagePreviewUrl, imagePreviewTitle, imagePreviewList, imagePreviewIndex, setImagePreviewIndex, closeModal } = useModalStore();
  const [zoom, setZoom] = useState(1);
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  const isModalOpen = isOpen && modalType === 'image-preview';

  useEffect(() => {
    setZoom(1);
  }, [imagePreviewIndex, isModalOpen]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, imagePreviewIndex, imagePreviewList]);

  if (!isModalOpen || !imagePreviewUrl) return null;

  const currentUrl = normalizeMediaUrl(imagePreviewList[imagePreviewIndex] || imagePreviewUrl);
  const totalCount = imagePreviewList.length;

  const handlePrev = () => {
    if (totalCount <= 1) return;
    const newIdx = (imagePreviewIndex - 1 + totalCount) % totalCount;
    setImagePreviewIndex(newIdx);
  };

  const handleNext = () => {
    if (totalCount <= 1) return;
    const newIdx = (imagePreviewIndex + 1) % totalCount;
    setImagePreviewIndex(newIdx);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent 
        hideCloseButton={true} 
        className={`w-full h-full max-w-full max-h-full sm:max-w-[95vw] sm:max-h-[95vh] p-0 overflow-hidden backdrop-blur-2xl border transition-colors duration-300 flex flex-col justify-between z-50 rounded-none sm:rounded-2xl [&::-webkit-scrollbar]:hidden [scrollbar-width:none] ${
          isDark 
            ? 'bg-slate-950/95 border-slate-800 text-white' 
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        <DialogTitle className="sr-only">{imagePreviewTitle || 'Pratinjau Gambar'}</DialogTitle>
        <DialogDescription className="sr-only">Pratinjau gambar resolusi penuh</DialogDescription>

        {/* Top Header Bar */}
        <div 
          className={`flex items-center justify-between px-3 py-2.5 sm:px-5 sm:py-3.5 z-30 gap-2 border-b transition-colors ${
            isDark 
              ? 'bg-slate-950/80 border-slate-800/60 text-white' 
              : 'bg-white/80 border-slate-200/60 text-slate-900'
          }`}
        >
          {/* Title & Index Badge */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-semibold text-xs sm:text-sm md:text-base truncate max-w-[140px] xs:max-w-[200px] sm:max-w-md">
              {imagePreviewTitle || 'Pratinjau Gambar'}
            </span>
            {totalCount > 1 && (
              <span 
                className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-mono shrink-0 font-medium ${
                  isDark ? 'bg-white/15 text-white/90' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {imagePreviewIndex + 1} / {totalCount}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Desktop Zoom controls */}
            <div 
              className={`hidden sm:flex items-center gap-1.5 p-1 rounded-lg border ${
                isDark ? 'bg-white/10 border-white/10' : 'bg-slate-100 border-slate-200/80'
              }`}
            >
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className={`p-1.5 rounded-md transition-colors ${
                  isDark ? 'hover:bg-white/20 text-white/80' : 'hover:bg-slate-200 text-slate-700'
                }`}
                title="Perkecil (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className={`p-1.5 rounded-md transition-colors ${
                  isDark ? 'hover:bg-white/20 text-white/80' : 'hover:bg-slate-200 text-slate-700'
                }`}
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className={`p-1.5 rounded-md transition-colors ${
                  isDark ? 'hover:bg-white/20 text-white/80' : 'hover:bg-slate-200 text-slate-700'
                }`}
                title="Perbesar (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Reset Zoom */}
            {zoom !== 1 && (
              <button
                onClick={() => setZoom(1)}
                className={`sm:hidden p-2 rounded-full text-xs font-mono font-bold ${
                  isDark ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                }`}
                title="Reset Zoom"
              >
                1x
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={closeModal}
              className={`p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer ${
                isDark ? 'bg-white/15 hover:bg-rose-500 text-white' : 'bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-700 border border-slate-200'
              }`}
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Container */}
        <div className="relative flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden select-none touch-pan-x">
          {totalCount > 1 && (
            <button
              onClick={handlePrev}
              className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full transition-all z-30 shadow-lg cursor-pointer hover:scale-110 backdrop-blur-md border ${
                isDark 
                  ? 'bg-black/60 hover:bg-primary text-white border-white/10' 
                  : 'bg-white/80 hover:bg-primary hover:text-white text-slate-800 border-slate-200'
              }`}
              title="Gambar Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentUrl}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: zoom }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full flex items-center justify-center overflow-hidden"
            >
              <img
                src={currentUrl}
                alt={imagePreviewTitle || "Pratinjau Gambar"}
                className={`max-w-full max-h-[72vh] sm:max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-xl transition-transform duration-200 cursor-grab active:cursor-grabbing ${
                  !isDark && 'border border-slate-200/60 shadow-slate-300/50'
                }`}
                style={{ transform: `scale(${zoom})` }}
              />
            </motion.div>
          </AnimatePresence>

          {totalCount > 1 && (
            <button
              onClick={handleNext}
              className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full transition-all z-30 shadow-lg cursor-pointer hover:scale-110 backdrop-blur-md border ${
                isDark 
                  ? 'bg-black/60 hover:bg-primary text-white border-white/10' 
                  : 'bg-white/80 hover:bg-primary hover:text-white text-slate-800 border-slate-200'
              }`}
              title="Gambar Selanjutnya"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* Bottom Thumbnails bar */}
        {totalCount > 1 && (
          <div 
            className={`p-2 sm:p-3 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto w-full z-30 scrollbar-none snap-x border-t transition-colors ${
              isDark 
                ? 'bg-slate-950/90 border-slate-800' 
                : 'bg-white/90 border-slate-200'
            }`}
          >
            {imagePreviewList.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setImagePreviewIndex(idx)}
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 snap-start ${
                  idx === imagePreviewIndex
                    ? 'border-primary scale-105 shadow-md ring-2 ring-primary/40'
                    : isDark 
                      ? 'border-white/20 opacity-50 hover:opacity-100' 
                      : 'border-slate-300 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={normalizeMediaUrl(imgUrl)}
                  alt={`Thumb ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
