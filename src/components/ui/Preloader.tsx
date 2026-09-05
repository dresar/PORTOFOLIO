import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, Code, Cpu, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PreloaderProps {
  progress: number;
  className?: string;
}

export const Preloader = ({ progress, className = "" }: PreloaderProps) => {
  const [statusText, setStatusText] = useState("Menghubungkan ke server...");

  // Update status message based on progress percentage
  useEffect(() => {
    if (progress < 25) {
      setStatusText("Mengamankan koneksi & melakukan jabat tangan...");
    } else if (progress < 50) {
      setStatusText("Memuat data profil & konfigurasi tema...");
    } else if (progress < 75) {
      setStatusText("Mensinkronisasikan riwayat pengalaman & sertifikat...");
    } else if (progress < 100) {
      setStatusText("Mengunduh katalog proyek kreatif & keterampilan...");
    } else {
      setStatusText("Selesai! Memulai aplikasi...");
    }
  }, [progress]);

  // Visual icons that animate as stages progress
  const getIconForProgress = () => {
    if (progress < 25) return <Terminal className="w-8 h-8 text-primary animate-pulse" />;
    if (progress < 50) return <Layers className="w-8 h-8 text-primary animate-pulse" />;
    if (progress < 75) return <Code className="w-8 h-8 text-primary animate-pulse" />;
    if (progress < 100) return <Cpu className="w-8 h-8 text-primary animate-pulse" />;
    return <Sparkles className="w-8 h-8 text-emerald-400 animate-bounce" />;
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden select-none ${className}`}
    >
      {/* Decorative Rotating Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <motion.div
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-primary/30 to-purple-600/30 blur-[100px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-blue-600/30 to-emerald-500/20 blur-[100px]"
          animate={{
            x: [0, -70, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Glassmorphic Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-[90%] max-w-[480px] p-8 md:p-10 rounded-2xl border border-white/[0.08] bg-black/60 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-6"
      >
        {/* Pulsing Outer Neon Ring around Icon */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-white/10 bg-white/[0.03] shadow-inner mb-2">
          {/* Animated Spinner Border */}
          <motion.div
            className="absolute inset-0 rounded-full border border-t-primary border-r-transparent border-b-transparent border-l-transparent"
            style={{ borderWidth: '3px' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          {/* Central Active Icon */}
          <AnimatePresence mode="wait">
            <motion.div
              key={progress < 25 ? 0 : progress < 50 ? 1 : progress < 75 ? 2 : progress < 100 ? 3 : 4}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {getIconForProgress()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Heading */}
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
            SINKRONISASI PORTFOLIO
          </h2>
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Sistem Sinkronisasi Aset
          </p>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full space-y-3 mt-4">
          <div className="flex justify-between items-center text-xs font-mono text-muted-foreground px-0.5">
            <span className="flex items-center gap-1.5 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              {statusText}
            </span>
            <span className="text-white font-semibold">{progress}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-white/[0.05] border border-white/[0.06] overflow-hidden p-[2px]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-purple-500 to-indigo-500 relative"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Glow Highlight */}
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/40 blur-[4px] rounded-full animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Premium Loading Subtext */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] text-muted-foreground font-mono">SECURE SYNC: ON</span>
          <span className="text-[10px] text-muted-foreground/30">•</span>
          <span className="text-[10px] text-muted-foreground font-mono">MEMORI CACHE: AKTIF</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Preloader;
