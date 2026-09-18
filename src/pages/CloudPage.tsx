import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Cloud, 
  Upload, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  ImageIcon, 
  Video, 
  Loader2, 
  RotateCcw,
  Sparkles,
  Layers,
  Globe,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface UploadResult {
  public_id: string;
  raw_url: string;
  jsdelivr_url: string;
  domain_url: string;
  format: string;
  bytes: number;
  resource_type: string;
  previewUrl?: string;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

async function convertImageToWebP(file: File): Promise<{ blob: Blob; filename: string }> {
  if (
    file.type === 'image/webp' || 
    file.type === 'image/gif' || 
    file.type === 'image/svg+xml' || 
    !file.type.startsWith('image/')
  ) {
    return { blob: file, filename: file.name };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ blob: file, filename: file.name });
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            resolve({ blob, filename: `${baseName}.webp` });
          } else {
            resolve({ blob: file, filename: file.name });
          }
        },
        'image/webp',
        0.9
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ blob: file, filename: file.name });
    };
    img.src = objectUrl;
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function CloudPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = useCallback(async (file: File) => {
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('✕ Berkas terlalu besar');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(20);

      const isImage = file.type.startsWith('image/');
      let uploadBlob: Blob = file;
      let uploadName = file.name;

      if (isImage) {
        setUploadProgress(40);
        const converted = await convertImageToWebP(file);
        uploadBlob = converted.blob;
        uploadName = converted.filename;
      }

      setUploadProgress(60);
      const base64 = await blobToBase64(uploadBlob);
      const localPreviewUrl = isImage ? URL.createObjectURL(uploadBlob) : undefined;

      setUploadProgress(80);
      const res = await fetch('/api/cloud/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          file: base64,
          filename: uploadName
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.details || errData?.error || 'Gagal mengunggah');
      }

      const data = await res.json();
      setUploadProgress(100);

      const origin = window.location.origin;
      const domainUrl = `${origin}/media/uploads/${data.public_id}`;

      setResult({
        public_id: data.public_id,
        raw_url: data.raw_url,
        jsdelivr_url: data.jsdelivr_url,
        domain_url: data.domain_url || domainUrl,
        format: data.format || file.name.split('.').pop() || 'bin',
        bytes: data.bytes || uploadBlob.size,
        resource_type: data.resource_type || (isImage ? 'image' : 'raw'),
        previewUrl: localPreviewUrl || data.jsdelivr_url
      });

      toast.success('✓ Berhasil!');
    } catch (err: any) {
      console.error('Upload Error:', err);
      toast.error(err?.message || '✕ Gagal!');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUploadFile(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) {
            handleUploadFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleUploadFile]);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success('✓ Disalin!');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('✕ Gagal!');
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  const links = result ? [
    {
      key: 'raw',
      title: 'Link Raw',
      badge: 'GitHub Raw',
      icon: Globe,
      desc: 'Tautan berkas repositori asli.',
      url: result.raw_url,
      accent: 'from-amber-500/20 to-amber-500/5',
      borderColor: 'border-amber-500/30 text-amber-400'
    },
    {
      key: 'jsdelivr',
      title: 'Link jsDelivr',
      badge: 'Edge CDN',
      icon: Sparkles,
      desc: 'CDN global berkecepatan tinggi.',
      url: result.jsdelivr_url,
      accent: 'from-indigo-500/20 to-indigo-500/5',
      borderColor: 'border-indigo-500/30 text-indigo-400'
    },
    {
      key: 'domain',
      title: 'Link Domain',
      badge: 'Proxy Asli',
      icon: Layers,
      desc: 'Domain masking resmi ke CDN.',
      url: result.domain_url,
      accent: 'from-emerald-500/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30 text-emerald-400'
    }
  ] : [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Website Official Header */}
      <Header />

      {/* Dynamic Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.4, 0.25]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 8, 
            ease: "easeInOut" 
          }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-primary/30 via-indigo-600/20 to-transparent blur-3xl rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 10, 
            delay: 1,
            ease: "easeInOut" 
          }}
          className="absolute top-1/3 -right-48 w-[450px] h-[450px] bg-purple-600/15 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.25, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 12, 
            delay: 2,
            ease: "easeInOut" 
          }}
          className="absolute top-1/2 -left-48 w-[450px] h-[450px] bg-emerald-600/15 blur-[120px] rounded-full"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-28 md:pt-36 pb-20 flex flex-col items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="uploader"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl flex flex-col gap-6"
            >
              {/* Animated Header Badge & Titles */}
              <div className="text-center space-y-3">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-medium tracking-wide shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>Ultra Fast CDN</span>
                </motion.div>

                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground/70">
                  Cloud CDN
                </h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Unggah berkas ke CDN global.
                </p>
              </div>

              {/* Glowing Interactive Glassmorphic Dropzone */}
              <div className="relative group">
                <div className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-primary/50 via-indigo-500/30 to-purple-500/50 opacity-40 group-hover:opacity-100 transition duration-500 blur-sm ${
                  isDragging ? 'opacity-100 scale-[1.01]' : ''
                }`} />

                <motion.div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.008 }}
                  whileTap={{ scale: 0.995 }}
                  className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-5 bg-card/85 backdrop-blur-2xl shadow-2xl ${
                    isDragging
                      ? 'border-primary bg-primary/15'
                      : 'border-border/70 hover:border-primary/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {/* Floating Animated Cloud Icon */}
                  <motion.div 
                    animate={isUploading ? { rotate: 360 } : { y: [0, -6, 0] }}
                    transition={isUploading ? { repeat: Infinity, duration: 1, ease: "linear" } : { repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                      {isUploading ? (
                        <Loader2 className="w-9 h-9 animate-spin text-primary" />
                      ) : (
                        <Upload className="w-9 h-9" />
                      )}
                    </div>
                    {!isUploading && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                    )}
                  </motion.div>

                  <div className="space-y-1.5">
                    <p className="text-base font-semibold text-foreground tracking-tight">
                      {isUploading ? 'Mengunggah...' : 'Pilih Berkas'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tarik berkas atau tekan Ctrl+V
                    </p>
                  </div>

                  {/* Upload Progress Bar when uploading */}
                  {isUploading && (
                    <div className="w-full max-w-xs space-y-1">
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary"
                          initial={{ width: '0%' }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Format Pills */}
                  <div className="pt-3 border-t border-border/50 w-full flex flex-wrap items-center justify-center gap-1.5">
                    {['WebP', 'PNG', 'JPG', 'SVG', 'GIF', 'PDF', 'MP4'].map((fmt) => (
                      <span 
                        key={fmt}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40"
                      >
                        {fmt}
                      </span>
                    ))}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium">
                      Maks. 20 MB
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            /* Upload Success Result Showcase */
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl flex flex-col gap-6"
            >
              {/* Header result row */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Unggah Berhasil</h2>
                    <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Aktif</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Berkas tersimpan di CDN global.</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs bg-secondary hover:bg-secondary/80 text-foreground border border-border/70 px-3.5 py-2 rounded-xl transition-all shadow-sm font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Upload Lagi</span>
                </motion.button>
              </div>

              {/* Asset Preview Card */}
              <div className="bg-card/90 border border-border/70 backdrop-blur-xl rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xl">
                <div className="w-24 h-24 rounded-xl bg-background/80 border border-border/80 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group relative">
                  {result.resource_type === 'image' && result.previewUrl ? (
                    <img
                      src={result.previewUrl}
                      alt={result.public_id}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : result.resource_type === 'video' ? (
                    <Video className="w-8 h-8 text-primary" />
                  ) : (
                    <FileText className="w-8 h-8 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {result.public_id.split('/').pop()}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground">
                    <span className="uppercase font-mono bg-muted px-2 py-0.5 rounded-md text-[10px] font-medium text-foreground">
                      {result.format}
                    </span>
                    <span>{formatBytes(result.bytes)}</span>
                    <span>•</span>
                    <span className="text-emerald-500 font-medium">Folder: Public</span>
                  </div>
                </div>
              </div>

              {/* 3 Links Showcase */}
              <div className="space-y-3.5">
                {links.map((item, idx) => {
                  const IconComponent = item.icon;
                  const isCopied = copiedKey === item.key;

                  return (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 + 0.1 }}
                      whileHover={{ y: -2 }}
                      className="bg-card/75 backdrop-blur-xl border border-border/70 rounded-2xl p-4 flex flex-col gap-3 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${item.accent} border ${item.borderColor}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold text-foreground">{item.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/60">
                            {item.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">{item.desc}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0 bg-background/80 border border-border/70 rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground/90 truncate select-all shadow-inner">
                          {item.url}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleCopy(item.url, item.key)}
                          className={`px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 shadow-sm ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                        </motion.button>

                        <motion.a
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground border border-border/70 transition-colors shrink-0 shadow-sm"
                          title="Buka Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </motion.a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Zero Trace Notice */}
              <div className="pt-2 text-center">
                <p className="text-xs text-muted-foreground">
                  Refresh halaman akan membersihkan tampilan lokal tanpa jejak. Berkas tetap aman di asset CDN.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Website Official Footer */}
      <Footer />
    </div>
  );
}
