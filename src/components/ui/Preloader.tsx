import { motion } from 'framer-motion';
import { Sparkles, Terminal, Code, Cpu, Layers, CheckCircle2 } from 'lucide-react';
import React, { useMemo } from 'react';

interface PreloaderProps {
  progress: number;
  loadedCount?: number;
  totalCount?: number;
  className?: string;
}

export const Preloader: React.FC<PreloaderProps> = ({ 
  progress, 
  loadedCount = 8, 
  totalCount = 8, 
  className = "" 
}) => {
  const boundedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  // Dynamic status text corresponding to download progress
  const statusInfo = useMemo(() => {
    if (boundedProgress < 25) {
      return {
        text: 'Menghubungkan ke API & verifikasi keamanan...',
        icon: <Terminal className="w-6 h-6 text-primary animate-pulse" />
      };
    }
    if (boundedProgress < 50) {
      return {
        text: 'Mengunduh profil, tema, & identitas pengembang...',
        icon: <Layers className="w-6 h-6 text-primary animate-pulse" />
      };
    }
    if (boundedProgress < 75) {
      return {
        text: 'Mensinkronkan keahlian, sertifikasi & riwayat kerja...',
        icon: <Code className="w-6 h-6 text-indigo-400 animate-pulse" />
      };
    }
    if (boundedProgress < 100) {
      return {
        text: 'Menyiapkan showcase proyek kreatif & integrasi...',
        icon: <Cpu className="w-6 h-6 text-purple-400 animate-pulse" />
      };
    }
    return {
      text: 'Semua data selesai diunduh! Membuka portofolio...',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />
    };
  }, [boundedProgress]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md overflow-hidden select-none ${className}`}
    >
      {/* Lightweight background ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-[92%] max-w-[420px] p-6 sm:p-8 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-5">
        
        {/* Top Icon Badge */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.04] shadow-inner">
          {/* Subtle spinning accent border */}
          <div 
            className="absolute inset-0 rounded-2xl border-2 border-primary/40 border-t-transparent animate-spin"
            style={{ animationDuration: '2s' }}
          />
          {statusInfo.icon}
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>MEMUAT PORTOFOLIO</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </h2>
          <p className="text-[11px] font-mono text-zinc-400 tracking-wider">
            SINKRONISASI DATA REAL-TIME
          </p>
        </div>

        {/* Real-time Progress Bar & Stats */}
        <div className="w-full space-y-2.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-300 text-[11px] truncate max-w-[260px] flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${boundedProgress === 100 ? 'bg-emerald-400' : 'bg-primary animate-ping'}`} />
              {statusInfo.text}
            </span>
            <span className="text-white font-bold ml-2">{boundedProgress}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-zinc-800/80 border border-white/5 overflow-hidden p-[1px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-emerald-400 transition-all duration-300 ease-out"
              style={{ width: `${boundedProgress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 pt-0.5">
            <span>Modul: {loadedCount}/{totalCount} Terverifikasi</span>
            <span className="text-emerald-400/90 font-semibold">CDN & DB Siap</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Preloader;
