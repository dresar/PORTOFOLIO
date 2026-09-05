/* 
 * ParticlesBackground sekarang menggunakan CSS murni (bukan framer-motion)
 * untuk mengurangi main thread blocking dan meningkatkan performa.
 * Sebelumnya: 50 partikel framer-motion → sekarang: 15 partikel CSS animation
 */
import { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

// Generate particles on module load (not in render / useEffect)
// so it's computed once and never changes between renders.
const PARTICLE_COUNT = 15;
const seededParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  x: ((i * 137.508) % 100), // Golden angle distribution – deterministic, no random
  y: ((i * 97.1) % 100),
  size: (i % 3) + 2,          // 2–4px
  duration: 15 + (i % 10),    // 15–24s
  delay: -(i * 1.5),           // stagger start times
  opacity: 0.3 + (i % 4) * 0.1,
}));

export const ParticlesBackground = () => {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {seededParticles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary/50"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `floatParticle ${p.duration}s ${p.delay}s infinite ease-in-out`,
            willChange: 'transform',
          }}
        />
      ))}

      {/* Static gradient orbs – no animation on main thread */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
        style={{
          background: 'hsl(var(--primary) / 0.08)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full"
        style={{
          background: 'hsl(var(--primary) / 0.05)',
          filter: 'blur(70px)',
        }}
      />
    </div>
  );
};
