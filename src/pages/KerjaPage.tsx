import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Unlock, ShieldCheck, FileText, Check, Copy,
  RefreshCw, Sparkles, AlertCircle, Eye, EyeOff,
  Download, ExternalLink, ArrowRight, BookOpen, MessageSquare,
  Award, ChevronRight, Zap
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
  const [teleprompterMode, setTeleprompterMode] = useState(false);

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
        toast({ title: '✓ Akses Terbuka', description: 'Selamat datang di Vault Kerja.' });
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
    toast({ title: 'Vault Dikunci' });
  };

  const handleCopyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: '✓ Teks Berhasil Disalin' });
  };

  const perkenalanItem = items.find(i => i.category === 'perkenalan');
  const tipsItem = items.find(i => i.category === 'tips');

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />

        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-md bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-sky-950/20"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="size-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Lock className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Vault Kerja & Wawancara</h1>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Halaman privat persiapan wawancara dan dokumen portofolio terenkripsi.
              </p>
            </div>
          </div>

          <form onSubmit={handleVerifyPin} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <div className="relative">
                <Input
                  ref={pinInputRef}
                  type={showPinText ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={12}
                  placeholder="Masukkan 6-digit PIN"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (pinError) setPinError(null);
                  }}
                  className="h-11 text-center font-mono text-lg tracking-widest bg-muted/40 border-border/60 rounded-xl pr-10 focus-visible:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPinText(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPinText ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {pinError && (
                <p className="text-xs text-destructive text-center flex items-center justify-center gap-1 mt-1 font-medium">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loadingPin || !pin.trim()}
              className="w-full h-9 text-xs rounded-lg font-semibold gap-2 active:scale-[0.98]"
            >
              {loadingPin ? <RefreshCw className="size-3.5 animate-spin" /> : <Unlock className="size-3.5" />}
              {loadingPin ? 'Memverifikasi...' : 'Buka Akses'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/40 text-center">
            <p className="text-[11px] text-muted-foreground">
              Akses dilindungi kode PIN internal pemilik portofolio.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      <header className="sticky top-0 z-40 bg-[#07090e]/80 backdrop-blur-md border-b border-border/50 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Vault Kerja</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PRIVATE
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Eka Syarif Maulana, S.Kom · Persiapan Wawancara & Lemari Dokumen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTeleprompterMode(p => !p)}
              className={cn(
                'h-8 text-xs gap-1.5 rounded-lg active:scale-[0.98]',
                teleprompterMode ? 'bg-sky-500/20 text-sky-400 border-sky-500/40' : ''
              )}
            >
              <BookOpen className="size-3.5" />
              <span className="hidden sm:inline">Mode Latihan Bicara</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchKerjaData}
              disabled={loadingData}
              className="h-8 size-8 p-0 rounded-lg shrink-0"
              title="Perbarui Data"
            >
              <RefreshCw className={cn('size-3.5', loadingData && 'animate-spin')} />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLock}
              className="h-8 text-xs gap-1.5 px-3 rounded-lg active:scale-[0.98]"
            >
              <Lock className="size-3.5" />
              <span className="hidden sm:inline">Kunci</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50 overflow-x-auto scrollbar-none">
          <Button
            type="button"
            variant={activeTab === 'perkenalan' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('perkenalan')}
            className="h-8 text-xs gap-1.5 font-medium rounded-lg px-3.5 shrink-0"
          >
            <Sparkles className="size-3.5 text-sky-400" />
            Perkenalan Diri (Elevator Pitch)
          </Button>
          <Button
            type="button"
            variant={activeTab === 'tips' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('tips')}
            className="h-8 text-xs gap-1.5 font-medium rounded-lg px-3.5 shrink-0"
          >
            <Zap className="size-3.5 text-amber-400" />
            Panduan & Tips HRD
          </Button>
          <Button
            type="button"
            variant={activeTab === 'qa' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('qa')}
            className="h-8 text-xs gap-1.5 font-medium rounded-lg px-3.5 shrink-0"
          >
            <MessageSquare className="size-3.5 text-emerald-400" />
            Latihan Tanya-Jawab (Q&A)
          </Button>
          <Button
            type="button"
            variant={activeTab === 'dokumen' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('dokumen')}
            className="h-8 text-xs gap-1.5 font-medium rounded-lg px-3.5 shrink-0"
          >
            <FileText className="size-3.5 text-rose-400" />
            Lemari Dokumen & Sertifikat ({documents.length})
          </Button>
        </div>

        {activeTab === 'perkenalan' && perkenalanItem && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{perkenalanItem.title}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Estimasi durasi: 45–50 detik · Bicara santai, wajar, dan percaya diri.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleCopyText(perkenalanItem.content_raw, 'raw-speech')}
                  className="h-8 text-xs gap-1.5 rounded-lg active:scale-[0.98]"
                >
                  {copiedId === 'raw-speech' ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  <span>Salin Teks Lengkap</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
                📍 Torgamba, Labusel
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                🎓 TI UMSU · IPK 3.68
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                🏢 PT Pertamina Hulu Rokan (Next.js)
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                🏛️ Sekretaris & Bendahara OPPM
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                📜 Sertifikasi Komputer & Office
              </span>
            </div>

            <div
              className={cn(
                'rounded-2xl border border-border/60 bg-card/80 p-5 sm:p-7 shadow-lg transition-all',
                teleprompterMode ? 'text-lg sm:text-xl leading-loose' : 'text-sm'
              )}
              dangerouslySetInnerHTML={{ __html: perkenalanItem.content_html }}
            />
          </motion.div>
        )}

        {activeTab === 'tips' && tipsItem && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-xl border border-border/60 bg-card/60">
              <h2 className="text-base font-bold text-white">{tipsItem.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rangkuman penting instruksi pembawaan diri dari pewawancara dan coach HRD.
              </p>
            </div>

            <div
              className="rounded-2xl border border-border/60 bg-card/80 p-5 sm:p-7 shadow-lg"
              dangerouslySetInnerHTML={{ __html: tipsItem.content_html }}
            />
          </motion.div>
        )}

        {activeTab === 'qa' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-xl border border-border/60 bg-card/60">
              <h2 className="text-base font-bold text-white">Bank Latihan Tanya-Jawab Wawancara</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simulasi pertanyaan yang sering diajukan HRD beserta strategi respon singkat dan tenang.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-border/50 bg-card space-y-2">
                <p className="text-xs font-semibold text-sky-400">Pertanyaan 1</p>
                <h3 className="font-medium text-sm text-white">
                  "Apa proyek paling menantang yang pernah Anda kerjakan selama magang di Pertamina Hulu Rokan?"
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/30">
                  <strong className="text-slate-100">Jawaban Kunci:</strong> "Di Pertamina Hulu Rokan Field Rantau, saya mengembangkan sistem inventaris dan website profil menggunakan Next.js. Tantangannya adalah memastikan data barang tercatat akurat dan antarmuka mudah digunakan oleh staf operasional lapangan. Pengalaman ini mengasah kemampuan saya beradaptasi cepat dengan kebutuhan tim di lingkungan BUMN."
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/50 bg-card space-y-2">
                <p className="text-xs font-semibold text-emerald-400">Pertanyaan 2</p>
                <h3 className="font-medium text-sm text-white">
                  "Bagaimana cara Anda beradaptasi jika perusahaan menggunakan teknologi yang belum pernah Anda pelajari sebelumnya?"
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/30">
                  <strong className="text-slate-100">Jawaban Kunci:</strong> "Saya memiliki fondasi kuat dari studi Teknologi Informasi di UMSU. Ketika menghadapi teknologi baru, saya membaca dokumentasi resmi, membedah basis kode yang sudah ada, dan langsung membuat prototipe sederhana. Saya tidak ragu berdiskusi dengan mentor tim agar proses adaptasi berlangsung cepat dan produktif."
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/50 bg-card space-y-2">
                <p className="text-xs font-semibold text-purple-400">Pertanyaan 3</p>
                <h3 className="font-medium text-sm text-white">
                  "Bagaimana pengalaman organisasi Anda di OPPM mendukung pekerjaan ini?"
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/30">
                  <strong className="text-slate-100">Jawaban Kunci:</strong> "Sebagai sekretaris sekaligus bendahara di OPPM, saya terbiasa mengelola dokumentasi rapi, mencatat keuangan secara akuntabel, dan berkomunikasi dengan banyak pihak. Sikap disiplin dan tanggung jawab ini membuat saya selalu teliti saat mengelola kode program maupun berkas pekerjaan."
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'dokumen' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-xl border border-border/60 bg-card/60">
              <h2 className="text-base font-bold text-white">Vault Dokumen & Sertifikat Pendukung</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aset berkas resmi berformat PDF dan gambar beresolusi tinggi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {documents.map((doc) => {
                const isPdf = doc.file_type === 'pdf' || /\.pdf($|\?)/i.test(doc.file_url);

                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-border/50 bg-card/80 hover:border-primary/50 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="size-10 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 flex items-center justify-center shrink-0">
                          <FileText className="size-5" />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted uppercase tracking-wider text-muted-foreground">
                          {doc.file_type}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-white line-clamp-2" title={doc.title}>
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {formatBytes(doc.file_size)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          asChild
                          className="h-7 text-xs px-2.5 rounded-md active:scale-[0.98] gap-1"
                        >
                          <a href={doc.file_url} target="_blank" rel="noreferrer">
                            <span>Buka Berkas</span>
                            <ExternalLink className="size-3" />
                          </a>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          asChild
                          className="size-7 rounded-md"
                        >
                          <a href={doc.file_url} target="_blank" rel="noreferrer" download title="Unduh Berkas">
                            <Download className="size-3.5" />
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
