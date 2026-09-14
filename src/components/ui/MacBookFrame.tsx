import React, { memo } from 'react';

interface MacBookFrameProps {
  src?: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  showGlow?: boolean;
}

export const MacBookFrame: React.FC<MacBookFrameProps> = memo(({
  src,
  alt = 'Project Preview',
  className = '',
  children,
  onClick,
  showGlow = true
}) => {
  return (
    <div className={`relative w-full max-w-5xl mx-auto select-none ${className}`}>
      {/* Ambient background glow like Gambar 2 */}
      {showGlow && (
        <div 
          className="absolute -inset-4 sm:-inset-8 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl rounded-[40px] pointer-events-none opacity-60 -z-10" 
          aria-hidden="true"
        />
      )}

      {/* ─── MACBOOK DISPLAY (TOP LID) ─── */}
      <div 
        className="relative mx-auto w-full rounded-t-[18px] sm:rounded-t-[28px] p-2.5 sm:p-3.5 md:p-4 pb-0 bg-[#16181f] border border-[#2b2f3a] shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all cursor-pointer group"
        onClick={onClick}
      >
        {/* Top Camera Bezel with lens */}
        <div className="flex items-center justify-center pb-2 sm:pb-2.5">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#0a0c10] border border-[#2c303c] flex items-center justify-center shadow-inner">
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-[#2563eb]/70 shadow-[0_0_2px_#3b82f6]" />
          </div>
        </div>

        {/* Screen Display Area (16:10 MacBook Aspect Ratio) */}
        <div className="relative aspect-[16/10] w-full bg-[#08090c] rounded-t-sm sm:rounded-t-md overflow-hidden border border-black/40 shadow-inner">
          {children ? (
            children
          ) : src ? (
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-contain bg-[#08090c] transition-transform duration-300 ease-out group-hover:scale-[1.01]"
              loading="eager"
              decoding="async"
              style={{ willChange: 'transform' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Tidak ada pratinjau
            </div>
          )}

          {/* Screen Glass Glare / Gloss highlight */}
          <div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none" 
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ─── MACBOOK BASE & HINGE ─── */}
      {/* Upper Hinge Line */}
      <div className="relative mx-auto w-full h-2 sm:h-3 bg-gradient-to-r from-[#1c1f27] via-[#2d323e] to-[#1c1f27] border-t border-[#0d0e12] flex items-center justify-center z-10">
        {/* Center Opening Thumb Notch */}
        <div className="w-14 sm:w-20 h-1 sm:h-1.5 bg-[#0a0c10] rounded-b-md shadow-inner" />
      </div>

      {/* Lower Aluminum Wedge Base (Extended Width matching realistic MacBook) */}
      <div className="relative w-[105%] -left-[2.5%] h-2 sm:h-3.5 bg-gradient-to-b from-[#353b47] via-[#222630] to-[#121419] rounded-b-[10px] sm:rounded-b-[16px] shadow-[0_12px_24px_rgba(0,0,0,0.8)] border-t border-[#464e5d]/30 flex items-center justify-center">
        {/* Subtle MacBook Air signature groove line */}
        <span className="text-[7px] sm:text-[9px] font-sans font-medium text-white/20 tracking-wider select-none transform -translate-y-0.5">
          MacBook Air
        </span>
      </div>

      {/* Ambient Drop Shadow underneath laptop */}
      <div 
        className="w-[90%] mx-auto h-3 sm:h-5 bg-black/80 blur-lg sm:blur-xl rounded-full -mt-1 pointer-events-none" 
        aria-hidden="true" 
      />
    </div>
  );
});

MacBookFrame.displayName = 'MacBookFrame';
