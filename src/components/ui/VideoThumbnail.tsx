import React, { useState, useEffect, useRef } from 'react';
import { Video, Play, ImageOff } from 'lucide-react';
import { cn, normalizeMediaUrl, isVideoUrl, getCloudinaryVideoThumbnail } from '@/lib/utils';

interface VideoThumbnailProps {
  src: string;
  poster?: string;
  alt?: string;
  className?: string;
  videoClassName?: string;
  showBadge?: boolean;
  showPlayIcon?: boolean;
  badgePosition?: 'center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onClick?: (e: React.MouseEvent) => void;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  src,
  poster,
  alt = 'Video thumbnail',
  className,
  videoClassName,
  showBadge = true,
  showPlayIcon = false,
  badgePosition = 'center',
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const normalizedSrc = normalizeMediaUrl(src);
  const cloudThumb = getCloudinaryVideoThumbnail(normalizedSrc);
  const candidatePoster = poster ? normalizeMediaUrl(poster) : (cloudThumb ? cloudThumb : null);
  const activePoster = !posterError && candidatePoster ? candidatePoster : null;

  const videoUrlWithTime = normalizedSrc.includes('#') 
    ? normalizedSrc 
    : `${normalizedSrc}#t=0.001`;

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setPosterError(false);

    const vid = videoRef.current;
    if (!vid) return;

    const handleLoaded = () => {
      if (vid.currentTime === 0) {
        try {
          vid.currentTime = 0.001;
        } catch {}
      }
      setIsLoaded(true);
    };

    const handleError = () => {
      setHasError(true);
    };

    vid.addEventListener('loadeddata', handleLoaded);
    vid.addEventListener('loadedmetadata', handleLoaded);
    vid.addEventListener('seeked', handleLoaded);
    vid.addEventListener('error', handleError);

    return () => {
      vid.removeEventListener('loadeddata', handleLoaded);
      vid.removeEventListener('loadedmetadata', handleLoaded);
      vid.removeEventListener('seeked', handleLoaded);
      vid.removeEventListener('error', handleError);
    };
  }, [normalizedSrc]);

  const renderBadge = () => {
    if (!showBadge && !showPlayIcon) return null;

    if (badgePosition === 'center') {
      return (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center pointer-events-none transition-colors group-hover/vthumb:bg-black/20">
          {showPlayIcon ? (
            <div className="size-7 sm:size-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-md">
              <Play className="size-3.5 fill-white ml-0.5" />
            </div>
          ) : (
            <div className="p-1.5 rounded-full bg-black/50 text-white shadow-sm">
              <Video className="w-4 h-4 text-white drop-shadow-md" />
            </div>
          )}
        </div>
      );
    }

    const posClasses = {
      'top-right': 'top-1.5 right-1.5',
      'top-left': 'top-1.5 left-1.5',
      'bottom-right': 'bottom-1.5 right-1.5',
      'bottom-left': 'bottom-1.5 left-1.5',
    }[badgePosition];

    return (
      <div className={cn('absolute pointer-events-none z-10', posClasses)}>
        <div className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-white/10">
          <Video className="size-3 text-white" />
          <span>VIDEO</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn('relative w-full h-full overflow-hidden bg-neutral-900 flex items-center justify-center group/vthumb', className)}
      onClick={onClick}
    >
      {activePoster ? (
        <img
          src={activePoster}
          alt={alt}
          className={cn('w-full h-full object-cover transition-transform duration-300', isLoaded ? 'opacity-100' : 'opacity-90', videoClassName)}
          onLoad={() => setIsLoaded(true)}
          onError={() => setPosterError(true)}
          loading="lazy"
        />
      ) : hasError ? (
        <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center p-2 text-center text-muted-foreground">
          <Video className="size-6 text-primary/70 mb-1" />
          <span className="text-[10px] font-semibold text-white/70">Video</span>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={videoUrlWithTime}
            preload="metadata"
            muted
            playsInline
            tabIndex={-1}
            aria-hidden="true"
            className={cn(
              'w-full h-full object-cover pointer-events-none transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              videoClassName
            )}
          />
          {!isLoaded && (
            <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center animate-pulse">
              <Video className="size-5 text-white/40" />
            </div>
          )}
        </>
      )}

      {renderBadge()}
    </div>
  );
};

export const MediaThumbnail: React.FC<{
  src: string;
  alt?: string;
  poster?: string;
  className?: string;
  imageClassName?: string;
  videoClassName?: string;
  showVideoBadge?: boolean;
  showPlayIcon?: boolean;
  videoBadgePosition?: 'center' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onClick?: (e: React.MouseEvent) => void;
  fallbackText?: string;
}> = ({
  src,
  alt = '',
  poster,
  className,
  imageClassName,
  videoClassName,
  showVideoBadge = true,
  showPlayIcon = false,
  videoBadgePosition = 'center',
  onClick,
  fallbackText,
}) => {
  const [hasError, setHasError] = useState(false);
  const isVideo = isVideoUrl(src);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (isVideo) {
    return (
      <VideoThumbnail
        src={src}
        poster={poster}
        alt={alt}
        className={className}
        videoClassName={videoClassName}
        showBadge={showVideoBadge}
        showPlayIcon={showPlayIcon}
        badgePosition={videoBadgePosition}
        onClick={onClick}
      />
    );
  }

  if (hasError || !src) {
    return (
      <div
        className={cn(
          'w-full h-full min-h-[60px] bg-muted/30 border border-border/40 flex flex-col items-center justify-center p-2 text-center text-muted-foreground select-none transition-colors',
          className
        )}
        onClick={onClick}
      >
        <ImageOff className="size-5 text-muted-foreground/40 mb-1" />
        <span className="text-[10px] font-medium text-muted-foreground/60 line-clamp-1">
          {fallbackText || alt || 'Gambar tidak tersedia'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={normalizeMediaUrl(src)}
      alt={alt}
      className={cn('w-full h-full object-cover', imageClassName, className)}
      loading="lazy"
      onError={() => setHasError(true)}
      onClick={onClick}
    />
  );
};
