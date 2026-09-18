import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Cloud, 
  Upload, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowLeft, 
  FileText, 
  ImageIcon, 
  Video, 
  Loader2, 
  RotateCcw,
  Sparkles,
  Layers,
  Globe
} from 'lucide-react';

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

      const isImage = file.type.startsWith('image/');
      let uploadBlob: Blob = file;
      let uploadName = file.name;

      if (isImage) {
        const converted = await convertImageToWebP(file);
        uploadBlob = converted.blob;
        uploadName = converted.filename;
      }

      const base64 = await blobToBase64(uploadBlob);
      const localPreviewUrl = isImage ? URL.createObjectURL(uploadBlob) : undefined;

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
      setResult({
        public_id: data.public_id,
        raw_url: data.raw_url,
        jsdelivr_url: data.jsdelivr_url,
        domain_url: data.domain_url,
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
      desc: 'Tautan langsung file repositori.',
      url: result.raw_url
    },
    {
      key: 'jsdelivr',
      title: 'Link jsDelivr',
      badge: 'Edge CDN',
      icon: Sparkles,
      desc: 'CDN global tercepat berskala multi-edge.',
      url: result.jsdelivr_url
    },
    {
      key: 'domain',
      title: 'Link Domain',
      badge: 'Proxy Asli',
      icon: Layers,
      desc: 'Domain kustom masking ke jsDelivr CDN.',
      url: result.domain_url
    }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors p-1.5 -ml-1.5 rounded-md hover:bg-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Cloud className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-white">Cloud CDN</span>
            </div>
          </div>

          <Link
            to="/admin/media"
            className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 px-2.5 py-1.5 rounded-md transition-colors border border-slate-800/80"
          >
            Admin Panel
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {!result ? (
          <div className="w-full max-w-xl flex flex-col gap-6">
            <div className="text-center space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-white">Cloud CDN</h1>
              <p className="text-xs text-slate-400">Unggah berkas ke CDN global.</p>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />

              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200">
                  {isUploading ? 'Mengunggah...' : 'Pilih Berkas'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Tarik berkas atau tekan Ctrl+V
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 w-full">
                <p className="text-[10px] text-slate-500 font-mono">
                  Maks. 20 MB. WebP, PNG, JPG, GIF, SVG, PDF, MP4.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Unggah Berhasil</h1>
                <p className="text-xs text-slate-400">Berkas tersimpan di CDN global.</p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload Lagi</span>
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                {result.resource_type === 'image' && result.previewUrl ? (
                  <img
                    src={result.previewUrl}
                    alt={result.public_id}
                    className="w-full h-full object-cover"
                  />
                ) : result.resource_type === 'video' ? (
                  <Video className="w-8 h-8 text-indigo-400" />
                ) : (
                  <FileText className="w-8 h-8 text-indigo-400" />
                )}
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                <p className="text-sm font-semibold text-slate-200 truncate">
                  {result.public_id.split('/').pop()}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-400">
                  <span className="uppercase font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                    {result.format}
                  </span>
                  <span>{formatBytes(result.bytes)}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">Folder: Public</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {links.map((item) => {
                const IconComponent = item.icon;
                const isCopied = copiedKey === item.key;

                return (
                  <div
                    key={item.key}
                    className="bg-slate-900/50 border border-slate-800/90 rounded-xl p-3.5 flex flex-col gap-2.5 transition-colors hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {item.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 hidden sm:inline">{item.desc}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0 bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 truncate select-all">
                        {item.url}
                      </div>

                      <button
                        onClick={() => handleCopy(item.url, item.key)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                        title="Buka Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-slate-500">
                Refresh halaman akan membersihkan tampilan lokal tanpa jejak. Berkas tetap aman di asset CDN.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
