import { useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useModalStore } from '@/store/modalStore';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { normalizeMediaUrl, isVideoUrl } from '@/lib/utils';
import { CustomVideoPlayer } from '@/components/ui/CustomVideoPlayer';
import { MediaThumbnail } from '@/components/ui/VideoThumbnail';
import { MacBookFrame } from '@/components/ui/MacBookFrame';

export const ImagePreviewModal = () => {
  const { 
    isOpen, 
    modalType, 
    imagePreviewUrl, 
    imagePreviewTitle, 
    imagePreviewList, 
    imagePreviewIndex, 
    setImagePreviewIndex, 
    closeModal 
  } = useModalStore();

  const isModalOpen = isOpen && modalType === 'image-preview';

  const totalCount = imagePreviewList?.length || 0;

  const handlePrev = useCallback(() => {
    if (totalCount <= 1) return;
    const newIdx = (imagePreviewIndex - 1 + totalCount) % totalCount;
    setImagePreviewIndex(newIdx);
  }, [totalCount, imagePreviewIndex, setImagePreviewIndex]);

  const handleNext = useCallback(() => {
    if (totalCount <= 1) return;
    const newIdx = (imagePreviewIndex + 1) % totalCount;
    setImagePreviewIndex(newIdx);
  }, [totalCount, imagePreviewIndex, setImagePreviewIndex]);

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
  }, [isModalOpen, handlePrev, handleNext, closeModal]);

  if (!isModalOpen || !imagePreviewUrl) return null;

  const currentUrl = normalizeMediaUrl(imagePreviewList[imagePreviewIndex] || imagePreviewUrl);
  const isCurrentVideo = isVideoUrl(currentUrl);

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent 
        hideCloseButton={true} 
        className="w-full h-full max-w-full max-h-full sm:max-w-[98vw] sm:max-h-[96vh] p-0 overflow-hidden bg-[#04060a]/95 border border-[#1a1f2c] text-white flex flex-col justify-between z-50 rounded-none sm:rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] will-change-transform"
      >
        <DialogTitle className="sr-only">{imagePreviewTitle || 'Pratinjau Gambar'}</DialogTitle>
        <DialogDescription className="sr-only">Pratinjau gambar showcase MacBook</DialogDescription>

        {/* ─── Top Header Bar ─── */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 z-30 border-b border-white/[0.08] bg-[#07090e]/80">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="font-semibold text-xs sm:text-sm md:text-base text-white/90 truncate max-w-[200px] sm:max-w-lg">
              {imagePreviewTitle || 'Pratinjau Proyek'}
            </span>
            {totalCount > 1 && (
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-mono shrink-0 font-medium bg-white/10 text-white/80 border border-white/10">
                {imagePreviewIndex + 1} / {totalCount}
              </span>
            )}
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 sm:p-2 rounded-full transition-all cursor-pointer bg-white/10 hover:bg-rose-500 hover:text-white text-white/80 border border-white/10 shadow-sm active:scale-95"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* ─── Center Display Area with MacBook Mockup ─── */}
        <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-y-auto overflow-x-hidden select-none">
          {/* Previous Button */}
          {totalCount > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full transition-all z-30 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 bg-black/60 hover:bg-primary text-white border border-white/15"
              title="Sebelumnya"
              aria-label="Gambar Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Laptop Mockup Wrapper */}
          <div className="w-full max-w-4xl py-2 flex items-center justify-center">
            {isCurrentVideo ? (
              <MacBookFrame showGlow={true} className="w-full">
                <CustomVideoPlayer key={currentUrl} src={currentUrl} className="w-full h-full aspect-[16/10]" />
              </MacBookFrame>
            ) : (
              <MacBookFrame
                key={currentUrl}
                src={currentUrl}
                alt={imagePreviewTitle || 'Project Preview'}
                showGlow={true}
                className="w-full"
              />
            )}
          </div>

          {/* Next Button */}
          {totalCount > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full transition-all z-30 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 bg-black/60 hover:bg-primary text-white border border-white/15"
              title="Selanjutnya"
              aria-label="Gambar Selanjutnya"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* ─── Bottom Thumbnails Bar ─── */}
        {totalCount > 1 && (
          <div className="p-2 sm:p-3 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto w-full z-30 scrollbar-none snap-x border-t border-white/[0.08] bg-[#07090e]/90">
            {imagePreviewList.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setImagePreviewIndex(idx)}
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 snap-start ${
                  idx === imagePreviewIndex
                    ? 'border-primary scale-105 shadow-lg ring-2 ring-primary/40 opacity-100'
                    : 'border-white/20 opacity-50 hover:opacity-90'
                }`}
                aria-label={`Slide ${idx + 1}`}
              >
                <MediaThumbnail
                  src={imgUrl}
                  alt={`Thumb ${idx + 1}`}
                  className="w-full h-full object-cover"
                  showVideoBadge={true}
                  videoBadgePosition="center"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
