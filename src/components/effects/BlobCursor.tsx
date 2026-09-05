import { useEffect, useRef } from 'react';

/**
 * BlobCursor - GPU-accelerated cursor effect using CSS custom properties.
 * Uses requestAnimationFrame instead of framer-motion to avoid main thread blocking.
 */
export const BlobCursor = () => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    let outerX = 0, outerY = 0;
    let targetX = 0, targetY = 0;
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      inner.style.transform = `translate(${targetX - 4}px, ${targetY - 4}px)`;
      inner.style.opacity = '1';
      outer.style.opacity = '1';
    };

    const onMouseLeave = () => {
      outer.style.opacity = '0';
      inner.style.opacity = '0';
    };

    const animate = () => {
      // Lerp outer blob towards cursor
      outerX += (targetX - outerX) * 0.12;
      outerY += (targetY - outerY) * 0.12;
      outer.style.transform = `translate(${outerX - 20}px, ${outerY - 20}px)`;
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Outer glow – GPU layer via will-change */}
      <div
        ref={outerRef}
        className="fixed pointer-events-none z-50 rounded-full opacity-0"
        style={{
          width: 40,
          height: 40,
          background: 'radial-gradient(circle, hsl(174 100% 41% / 0.3), transparent 70%)',
          boxShadow: '0 0 60px 30px hsl(174 100% 41% / 0.15)',
          willChange: 'transform',
          transition: 'opacity 0.3s',
        }}
        aria-hidden="true"
      />
      {/* Inner dot */}
      <div
        ref={innerRef}
        className="fixed pointer-events-none z-50 w-2 h-2 rounded-full bg-primary opacity-0"
        style={{
          willChange: 'transform',
          transition: 'opacity 0.3s',
        }}
        aria-hidden="true"
      />
    </>
  );
};
