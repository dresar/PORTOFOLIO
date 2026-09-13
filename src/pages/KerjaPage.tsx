import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Lock, Unlock, FileText,
  Sparkles, AlertCircle, Eye, EyeOff,
  Download, ExternalLink, MessageSquare, Zap, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn, formatBytes } from '@/lib/utils';
import axios from 'axios';

interface KerjaItem {
  id: number;
  category: string;
  title: string;
  content_html: string;
  content_raw: string;
  order: number;
}

interface KerjaDocument {
  id: number;
  title: string;
  category: string;
  file_url: string;
  file_type: string;
  file_size: number;
  description: string;
  order: number;
}

export default function KerjaPage() {
  const { toast } = useToast();

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('kerja_unlocked') === 'true';
  });
  const [pin, setPin] = useState('');
  const [loadingPin, setLoadingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [showPinText, setShowPinText] = useState(false);

  const [activeTab, setActiveTab] = useState<'perkenalan' | 'tips' | 'qa' | 'dokumen'>('perkenalan');
  const [items, setItems] = useState<KerjaItem[]>([]);
  const [documents, setDocuments] = useState<KerjaDocument[]>([]);
  const [qaSearch, setQaSearch] = useState('');

  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    let created = false;
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
      created = true;
    }
    const prevContent = metaRobots.content;
    metaRobots.content = 'noindex, nofollow, noarchive, nosnippet';

    return () => {
      if (created) {
        metaRobots.remove();
      } else {
        metaRobots.content = prevContent;
      }
    };
  }, []);

  useEffect(() => {
    if (!isUnlocked) {
      setTimeout(() => pinInputRef.current?.focus(), 150);
    } else {
      fetchKerjaData();
    }
  }, [isUnlocked]);

  const fetchKerjaData = async () => {
    try {
      const res = await axios.get('/api/kerja/public-data');
      if (res.data) {
        setItems(res.data.items || []);
        setDocuments(res.data.documents || []);
      }
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal memuat data',
        description: e?.response?.data?.error || e.message
      });
    }
  };

  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setPinError('Masukkan PIN Anda');
      return;
    }

    setLoadingPin(true);
    setPinError(null);

    try {
      const res = await axios.post('/api/kerja/verify-pin', { pin: pin.trim() });
      if (res.data?.success) {
        sessionStorage.setItem('kerja_unlocked', 'true');
        setIsUnlocked(true);
      } else {
        throw new Error(res.data?.error || 'PIN salah');
      }
    } catch (err: any) {
      setPinError(err?.response?.data?.error || 'PIN yang Anda masukkan salah.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin('');
      pinInputRef.current?.focus();
    } finally {
      setLoadingPin(false);
    }
  };

  const perkenalanItem = items.find(i => i.category === 'perkenalan');
  const tipsItems = items.filter(i => i.category === 'tips');
  const qaItems = items.filter(i => i.category === 'qa');

  const filteredQaItems = qaItems.filter(item => {
    if (!qaSearch.trim()) return true;
    const q = qaSearch.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.content_raw.toLowerCase().includes(q);
  });

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-3 sm:p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />

        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-xs bg-card/85 backdrop-blur-xl border border-border/60 rounded-xl p-5 shadow-2xl"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="size-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Lock className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">Akses PIN</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Masukkan kode PIN untuk melihat materi.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyPin} className="mt-4 space-y-2.5">
            <div className="space-y-1">
              <div className="relative">
                <Input
                  ref={pinInputRef}
                  type={showPinText ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={12}
                  placeholder="PIN 6-digit"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (pinError) setPinError(null);
                  }}
                  className="h-9 text-center font-mono text-sm tracking-widest bg-muted/40 border-border/60 rounded-lg pr-9 focus-visible:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPinText(p => !p)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPinText ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>

              {pinError && (
                <p className="text-[10px] text-destructive text-center flex items-center justify-center gap-1 mt-1 font-medium">
                  <AlertCircle className="size-3 shrink-0" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loadingPin || !pin.trim()}
              className="w-full h-8 text-xs rounded-lg font-semibold gap-1.5 active:scale-[0.98]"
            >
              <Unlock className="size-3" />
              <span>{loadingPin ? 'Memverifikasi...' : 'Buka'}</span>
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      <main className="w-full max-w-2xl mx-auto flex-1 px-1 sm:px-3 pt-1.5 pb-16 space-y-2">
        {activeTab === 'perkenalan' && perkenalanItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
          >
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: perkenalanItem.content_html }}
            />
          </motion.div>
        )}

        {activeTab === 'tips' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-1.5"
          >
            <div className="px-1 py-1">
              <h2 className="text-xs font-bold text-white">Panduan & Tips Wawancara HRD</h2>
              <p className="text-[10px] text-slate-400">Prinsip dasar sikap dan respon saat interview.</p>
            </div>

            <div className="space-y-1.5">
              {tipsItems.map((tip) => (
                <div
                  key={tip.id}
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-1.5"
                >
                  <h3 className="text-xs font-semibold text-sky-400">
                    {tip.title}
                  </h3>
                  <div
                    className="text-[11px] leading-relaxed text-slate-300"
                    dangerouslySetInnerHTML={{ __html: tip.content_html }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'qa' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2 px-1 py-1">
              <div>
                <h2 className="text-xs font-bold text-white">Tanya-Jawab ({qaItems.length})</h2>
                <p className="text-[10px] text-slate-400">Pertanyaan umum HRD & respon terarah.</p>
              </div>

              <div className="relative w-36 sm:w-48">
                <Search className="size-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari..."
                  value={qaSearch}
                  onChange={(e) => setQaSearch(e.target.value)}
                  className="h-6 pl-6 pr-2 text-[10px] bg-slate-900/80 border-slate-800 rounded"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              {filteredQaItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground border border-dashed border-slate-800 rounded-lg">
                  Tidak ada pertanyaan yang sesuai.
                </div>
              ) : (
                filteredQaItems.map((qa) => (
                  <div
                    key={qa.id}
                    className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 space-y-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="size-4 rounded bg-sky-500/15 text-sky-400 font-mono text-[9px] flex items-center justify-center font-semibold shrink-0">
                        {qa.order}
                      </span>
                      <h3 className="font-semibold text-xs text-white">
                        {qa.title}
                      </h3>
                    </div>
                    <div
                      className="text-[11px] leading-relaxed text-slate-300 pl-5"
                      dangerouslySetInnerHTML={{ __html: qa.content_html }}
                    />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'dokumen' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-1.5"
          >
            <div className="px-1 py-1">
              <h2 className="text-xs font-bold text-white">Berkas & Dokumen ({documents.length})</h2>
              <p className="text-[10px] text-slate-400">File berkas PDF & sertifikat pendukung.</p>
            </div>

            <div className="space-y-1.5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900/80 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-7 rounded bg-red-500/15 text-red-400 border border-red-500/25 flex items-center justify-center shrink-0">
                      <FileText className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-xs text-white truncate" title={doc.title}>
                        {doc.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 truncate">
                        {formatBytes(doc.file_size)} · {doc.file_type.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      asChild
                      className="h-6 text-[10px] px-2 rounded active:scale-[0.98] gap-1"
                    >
                      <a href={doc.file_url} target="_blank" rel="noreferrer">
                        <span>Buka</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      asChild
                      className="size-6 rounded"
                    >
                      <a href={doc.file_url} target="_blank" rel="noreferrer" download title="Unduh">
                        <Download className="size-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#07090e]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('perkenalan')}
            className={cn(
              "flex flex-col items-center justify-center py-1 rounded text-[10px] transition-colors",
              activeTab === 'perkenalan'
                ? "text-sky-400 bg-sky-500/10 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Sparkles className="size-3.5 mb-0.5" />
            <span>Perkenalan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tips')}
            className={cn(
              "flex flex-col items-center justify-center py-1 rounded text-[10px] transition-colors",
              activeTab === 'tips'
                ? "text-amber-400 bg-amber-500/10 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Zap className="size-3.5 mb-0.5" />
            <span>Tips</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qa')}
            className={cn(
              "flex flex-col items-center justify-center py-1 rounded text-[10px] transition-colors",
              activeTab === 'qa'
                ? "text-emerald-400 bg-emerald-500/10 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <MessageSquare className="size-3.5 mb-0.5" />
            <span>Tanya</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dokumen')}
            className={cn(
              "flex flex-col items-center justify-center py-1 rounded text-[10px] transition-colors",
              activeTab === 'dokumen'
                ? "text-rose-400 bg-rose-500/10 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <FileText className="size-3.5 mb-0.5" />
            <span>Berkas</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
