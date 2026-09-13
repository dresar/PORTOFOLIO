import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Unlock, ShieldCheck, FileText, Check, Copy,
  RefreshCw, Sparkles, AlertCircle, Eye, EyeOff,
  Download, ExternalLink, MessageSquare, Zap,
  Play, Square, RotateCcw, Search, CheckCircle2
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
  const [loadingData, setLoadingData] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [qaSearch, setQaSearch] = useState('');

  const [memorizedIds, setMemorizedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('kerja_memorized_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

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

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const fetchKerjaData = async () => {
    setLoadingData(true);
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
    } finally {
      setLoadingData(false);
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
        toast({ title: 'Akses Terbuka', description: 'Selamat datang di Vault Kerja.' });
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

  const handleLock = () => {
    sessionStorage.removeItem('kerja_unlocked');
    setIsUnlocked(false);
    setPin('');
    setPinError(null);
    setIsTimerRunning(false);
    setTimerSeconds(0);
    toast({ title: 'Vault Dikunci' });
  };

  const handleCopyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Teks Berhasil Disalin' });
  };

  const toggleMemorized = (id: number) => {
    setMemorizedIds(prev => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter(x => x !== id) : [...prev, id];
      try {
        localStorage.setItem('kerja_memorized_items', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const perkenalanItem = items.find(i => i.category === 'perkenalan');
  const tipsItems = items.filter(i => i.category === 'tips');
  const qaItems = items.filter(i => i.category === 'qa');

  const filteredQaItems = qaItems.filter(item => {
    if (!qaSearch.trim()) return true;
    const q = qaSearch.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.content_raw.toLowerCase().includes(q);
  });

  const totalItemsCount = items.length;
  const memorizedCount = memorizedIds.filter(id => items.some(i => i.id === id)).length;
  const memorizedPercent = totalItemsCount > 0 ? Math.round((memorizedCount / totalItemsCount) * 100) : 0;

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-3 sm:p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />

        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-sm bg-card/85 backdrop-blur-xl border border-border/60 rounded-xl p-5 sm:p-6 shadow-2xl"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="size-10 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Lock className="size-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">Vault Kerja</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Masukkan PIN akses persiapan wawancara.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyPin} className="mt-4 space-y-3">
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
                  className="h-10 text-center font-mono text-base tracking-widest bg-muted/40 border-border/60 rounded-lg pr-9 focus-visible:ring-sky-500"
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
                <p className="text-[11px] text-destructive text-center flex items-center justify-center gap-1 mt-1 font-medium">
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
              {loadingPin ? <RefreshCw className="size-3 animate-spin" /> : <Unlock className="size-3" />}
              <span>{loadingPin ? 'Memverifikasi...' : 'Buka Akses'}</span>
            </Button>
          </form>

          <div className="mt-4 pt-3 border-t border-border/40 text-center">
            <p className="text-[10px] text-muted-foreground">
              Akses privat internal pemilik portofolio.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b border-border/50 px-2.5 sm:px-6 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="size-6 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-3.5" />
            </div>
            <span className="font-bold text-xs sm:text-sm text-white truncate">Vault Kerja</span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              PRIVATE
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 bg-card/70 border border-border/50 px-2 py-0.5 rounded text-[11px]">
              <span className="text-muted-foreground">Hafalan:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {memorizedCount}/{totalItemsCount} ({memorizedPercent}%)
              </span>
            </div>

            <div className="flex items-center gap-1 bg-card/80 border border-border/50 px-1.5 py-0.5 rounded text-xs">
              <span className="text-[11px] font-mono text-sky-400 min-w-[32px] text-center">
                {formatTimer(timerSeconds)}
              </span>
              {!isTimerRunning ? (
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(true)}
                  className="size-5 flex items-center justify-center rounded text-slate-300 hover:text-white"
                  title="Mulai Latihan"
                >
                  <Play className="size-2.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(false)}
                  className="size-5 flex items-center justify-center rounded text-amber-400"
                  title="Jeda"
                >
                  <Square className="size-2" />
                </button>
              )}
              {timerSeconds > 0 && !isTimerRunning && (
                <button
                  type="button"
                  onClick={() => setTimerSeconds(0)}
                  className="size-5 flex items-center justify-center rounded text-muted-foreground hover:text-white"
                  title="Reset"
                >
                  <RotateCcw className="size-2" />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchKerjaData}
              disabled={loadingData}
              className="h-6 w-6 p-0 rounded shrink-0"
              title="Perbarui"
            >
              <RefreshCw className={cn('size-2.5', loadingData && 'animate-spin')} />
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLock}
              className="h-6 text-[10px] sm:text-xs px-2 rounded active:scale-[0.98]"
            >
              <Lock className="size-2.5 mr-1" />
              <span>Kunci</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-2 sm:px-6 py-2.5 sm:py-5 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-1 bg-card/60 p-1 rounded-lg border border-border/40 overflow-x-auto scrollbar-none w-full">
          <Button
            type="button"
            variant={activeTab === 'perkenalan' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('perkenalan')}
            className="h-7 text-xs font-medium rounded-md px-2.5 sm:px-3 shrink-0"
          >
            <Sparkles className="size-3 mr-1 text-sky-400" />
            Perkenalan
          </Button>
          <Button
            type="button"
            variant={activeTab === 'tips' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('tips')}
            className="h-7 text-xs font-medium rounded-md px-2.5 sm:px-3 shrink-0"
          >
            <Zap className="size-3 mr-1 text-amber-400" />
            Tips HRD
          </Button>
          <Button
            type="button"
            variant={activeTab === 'qa' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('qa')}
            className="h-7 text-xs font-medium rounded-md px-2.5 sm:px-3 shrink-0"
          >
            <MessageSquare className="size-3 mr-1 text-emerald-400" />
            Q&A ({qaItems.length})
          </Button>
          <Button
            type="button"
            variant={activeTab === 'dokumen' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('dokumen')}
            className="h-7 text-xs font-medium rounded-md px-2.5 sm:px-3 shrink-0"
          >
            <FileText className="size-3 mr-1 text-rose-400" />
            Berkas ({documents.length})
          </Button>
        </div>

        {activeTab === 'perkenalan' && perkenalanItem && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 w-full"
          >
            <div className="flex items-center justify-between gap-2 p-2 sm:p-3 rounded-lg border border-border/40 bg-card/40">
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-semibold text-white truncate">
                  {perkenalanItem.title}
                </h2>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
                  Naskah lengkap percakapan wajar dan santai.
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  size="sm"
                  variant={memorizedIds.includes(perkenalanItem.id) ? 'default' : 'outline'}
                  onClick={() => toggleMemorized(perkenalanItem.id)}
                  className="h-6 text-[11px] px-2 rounded active:scale-[0.98] gap-1"
                >
                  <CheckCircle2 className="size-3" />
                  <span>
                    {memorizedIds.includes(perkenalanItem.id) ? 'Dihafal' : 'Tandai'}
                  </span>
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleCopyText(perkenalanItem.content_raw, `raw-${perkenalanItem.id}`)}
                  className="h-6 text-[11px] px-2 rounded active:scale-[0.98] gap-1"
                >
                  {copiedId === `raw-${perkenalanItem.id}` ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  <span>Salin</span>
                </Button>
              </div>
            </div>

            <div
              className="w-full rounded-xl border border-border/40 bg-card/40 p-2 sm:p-4 shadow-sm"
              dangerouslySetInnerHTML={{ __html: perkenalanItem.content_html }}
            />
          </motion.div>
        )}

        {activeTab === 'tips' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5 w-full"
          >
            <div className="p-2 sm:p-3 rounded-lg border border-border/40 bg-card/40">
              <h2 className="text-xs sm:text-sm font-semibold text-white">Panduan & Tips Wawancara HRD</h2>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                Prinsip sikap, pernafasan, dan etika saat sesi wawancara.
              </p>
            </div>

            <div className="space-y-2.5">
              {tipsItems.map((tip) => {
                const isMem = memorizedIds.includes(tip.id);

                return (
                  <div
                    key={tip.id}
                    className="p-3 sm:p-4 rounded-xl border border-border/40 bg-card/60 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-border/30 pb-1.5">
                      <h3 className="text-xs font-semibold text-white flex items-center gap-1.5 truncate">
                        {isMem && <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />}
                        <span className="truncate">{tip.title}</span>
                      </h3>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleMemorized(tip.id)}
                          className={cn(
                            'h-5 text-[10px] px-1.5 rounded',
                            isMem ? 'text-emerald-400' : 'text-muted-foreground'
                          )}
                        >
                          <CheckCircle2 className="size-2.5 mr-0.5" />
                          <span>{isMem ? 'Hafal' : 'Tandai'}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyText(tip.content_raw, `tip-${tip.id}`)}
                          className="h-5 text-[10px] px-1.5 rounded text-muted-foreground hover:text-white"
                        >
                          {copiedId === `tip-${tip.id}` ? <Check className="size-2.5 text-emerald-400 mr-0.5" /> : <Copy className="size-2.5 mr-0.5" />}
                          <span>Salin</span>
                        </Button>
                      </div>
                    </div>

                    <div
                      className="text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: tip.content_html }}
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'qa' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5 w-full"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg border border-border/40 bg-card/40">
              <div>
                <h2 className="text-xs sm:text-sm font-semibold text-white">Bank Tanya-Jawab ({qaItems.length})</h2>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                  Simulasi pertanyaan HRD & User beserta respon kunci.
                </p>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="size-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari pertanyaan..."
                  value={qaSearch}
                  onChange={(e) => setQaSearch(e.target.value)}
                  className="h-6 pl-7 pr-2.5 text-xs bg-muted/30 border-border/40 rounded"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredQaItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border/40 rounded-lg">
                  Tidak ada pertanyaan yang sesuai "{qaSearch}".
                </div>
              ) : (
                filteredQaItems.map((qa) => {
                  const isMem = memorizedIds.includes(qa.id);

                  return (
                    <div
                      key={qa.id}
                      className={cn(
                        'p-2.5 sm:p-3.5 rounded-xl border bg-card/60 space-y-2',
                        isMem ? 'border-emerald-500/30' : 'border-border/40'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-border/30 pb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="size-4 rounded bg-muted/60 text-muted-foreground font-mono text-[9px] flex items-center justify-center font-semibold shrink-0">
                            {qa.order}
                          </span>
                          <h3 className="font-semibold text-xs text-white truncate">
                            {qa.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleMemorized(qa.id)}
                            className={cn(
                              'h-5 text-[10px] px-1.5 rounded',
                              isMem ? 'text-emerald-400' : 'text-muted-foreground'
                            )}
                          >
                            <CheckCircle2 className="size-2.5 mr-0.5" />
                            <span>{isMem ? 'Dikuasai' : 'Tandai'}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyText(qa.content_raw, `qa-${qa.id}`)}
                            className="h-5 text-[10px] px-1.5 rounded text-muted-foreground hover:text-white"
                          >
                            {copiedId === `qa-${qa.id}` ? <Check className="size-2.5 text-emerald-400 mr-0.5" /> : <Copy className="size-2.5 mr-0.5" />}
                            <span>Salin</span>
                          </Button>
                        </div>
                      </div>

                      <div
                        className="text-xs leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: qa.content_html }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'dokumen' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5 w-full"
          >
            <div className="p-2 sm:p-3 rounded-lg border border-border/40 bg-card/40">
              <h2 className="text-xs sm:text-sm font-semibold text-white">Lemari Dokumen & Sertifikat</h2>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                Aset berkas PDF dan sertifikat resmi pendukung.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {documents.map((doc) => {
                return (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl border border-border/40 bg-card/70 flex flex-col justify-between space-y-2"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="size-7 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 flex items-center justify-center shrink-0">
                          <FileText className="size-3.5" />
                        </div>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-muted uppercase text-muted-foreground">
                          {doc.file_type}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-xs text-white line-clamp-2" title={doc.title}>
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {formatBytes(doc.file_size)}
                      </span>
                      <div className="flex items-center gap-1">
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
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
