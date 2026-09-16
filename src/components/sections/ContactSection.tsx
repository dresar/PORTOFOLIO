import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, Phone, MapPin, Send, Loader2, Check, Copy, 
  ExternalLink, Clock, Sparkles, MessageCircle, 
  User, FileText, MessageSquare, ShieldCheck, ArrowRight,
  Globe2, CheckCircle2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { useMutation } from '@tanstack/react-query';
import { messagesAPI } from '@/services/api';
import { toast } from 'sonner';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { safeUrl } from '@/lib/utils';

export const ContactSection = () => {
  const { t, i18n } = useTranslation();
  const isId = i18n.language === 'id';
  const { profile } = useProfile();
  const { socialLinks } = useSocialLinks();
  const normalizedSocialLinks = Array.isArray(socialLinks) ? socialLinks : [];
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  const quickTopics = [
    { labelId: '🚀 Aplikasi Web', labelEn: '🚀 Web App', value: 'Pengembangan Aplikasi Web Modern' },
    { labelId: '📱 Mobile App', labelEn: '📱 Mobile App', value: 'Pengembangan Mobile App (iOS/Android)' },
    { labelId: '🤖 AI & Otomasi', labelEn: '🤖 AI & Automation', value: 'Integrasi AI & Otomasi Workflow' },
    { labelId: '⚡ Cloud & Performa', labelEn: '⚡ Cloud & Perf', value: 'Optimasi Arsitektur Cloud & Performa' },
    { labelId: '💼 Peluang Karir', labelEn: '💼 Career Role', value: 'Diskusi Peluang Karir / Full-time Role' },
  ];

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat(isId ? 'id-ID' : 'en-US', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date());
        setCurrentTime(`${timeStr} WIB (UTC+7)`);
      } catch {
        setCurrentTime('WIB (UTC+7)');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, [isId]);

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: messagesAPI.create,
    onSuccess: () => {
      toast.success(isId ? 'Pesan berhasil dikirim! Eka Syarif akan segera merespons Anda.' : 'Message sent successfully! Eka Syarif will get back to you shortly.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast.error(isId ? 'Gagal mengirim pesan. Silakan gunakan WhatsApp langsung untuk respon instan.' : 'Failed to send message. Please contact via WhatsApp directly for an instant response.');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectTopic = (val: string) => {
    setFormData(prev => ({ ...prev, subject: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({
      senderName: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(isId ? `${label} berhasil disalin` : `${label} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const [showMap, setShowMap] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShowMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const defaultMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d254832.505334234!2d98.50467742924397!3d3.642614143767466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x303131cc1c3eb2fd%3A0x23d431c8a6908262!2sMedan%2C%20Kota%20Medan%2C%20Sumatera%20Utara!5e0!3m2!1sid!2sid!4v1769453045591!5m2!1sid!2sid";
  
  const getMapSrc = (input: string | null | undefined) => {
    if (!input) return defaultMapUrl;
    if (input.includes('<iframe')) {
      const srcMatch = input.match(/src="([^"]+)"/);
      return srcMatch ? srcMatch[1] : defaultMapUrl;
    }
    return input;
  };

  const mapUrl = getMapSrc((profile as any)?.map_embed_url);
  const isValidMapUrl = mapUrl && (mapUrl.startsWith('http') || mapUrl.startsWith('https'));

  const emailVal = profile?.email || 'eka.ckp16799@gmail.com';
  const phoneVal = profile?.phone || '+6282392115909';
  const cleanPhone = phoneVal.replace(/[^0-9]/g, '');

  const rawLocation = profile?.location || 'Medan, Sumatera Utara, Indonesia';
  const isCoordinates = /^[\d\s.,\-+]+$/.test(rawLocation.trim());
  const locationVal = isCoordinates ? 'Medan, Sumatera Utara, Indonesia' : rawLocation;

  const whatsappGreeting = encodeURIComponent(
    isId 
      ? 'Halo Mas Eka Syarif, saya melihat portofolio Anda dan tertarik untuk mendiskusikan peluang proyek kolaborasi.'
      : 'Hello Eka Syarif, I reviewed your portfolio and would like to discuss a project collaboration opportunity.'
  );

  return (
    <section id="contact" className="py-20 md:py-28 relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-[160px]" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-semibold mb-4 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-wide">
              {isId ? 'TERBUKA UNTUK KOLABORASI & PROYEK BARU' : 'OPEN FOR COLLABORATIONS & HIGH-IMPACT ROLES'}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight mb-4 text-foreground">
            {isId ? (
              <>
                Mari Berkolaborasi & <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent">Wujudkan Solusi Hebat</span>
              </>
            ) : (
              <>
                Let's Collaborate & <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent">Architect Scalable Solutions</span>
              </>
            )}
          </h2>

          <p className="text-muted-foreground dark:text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {isId 
              ? 'Punya ide produk digital, kebutuhan rekayasa web/mobile, sistem otomasi AI, atau tawaran posisi profesional? Pintu komunikasi selalu terbuka.'
              : 'Whether you are seeking to build an ambitious product, scale enterprise cloud architecture, deploy intelligent AI solutions, or discuss career roles — let’s connect.'}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-6 md:p-8 shadow-xl hover:border-primary/40 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="flex items-center justify-between pb-5 mb-5 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">
                    {isId ? 'Kirim Pesan Langsung' : 'Send a Direct Message'}
                  </h3>
                  <p className="text-xs text-muted-foreground dark:text-zinc-400">
                    {isId ? 'Tinggalkan rincian proyek atau pertanyaan Anda di bawah ini' : 'Detail your project scope or engineering inquiry below'}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-500/30 px-2.5 py-1 rounded-md font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{isId ? 'Respon < 2 jam' : 'Replies < 2 hrs'}</span>
              </div>
            </div>

            <div className="mb-5 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-zinc-400">
                {isId ? 'Pilih Topik Kebutuhan:' : 'Select Topic / Scope:'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickTopics.map((topic) => {
                  const isSelected = formData.subject === topic.value;
                  return (
                    <button
                      key={topic.value}
                      type="button"
                      onClick={() => handleSelectTopic(topic.value)}
                      className={`h-7 px-2.5 rounded-md text-[11px] font-medium border transition-all active:scale-[0.98] ${
                        isSelected 
                          ? 'bg-primary text-black font-semibold border-primary shadow-xs' 
                          : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground dark:text-zinc-300 dark:hover:text-white border-border/60'
                      }`}
                    >
                      {isId ? topic.labelId : topic.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>{isId ? 'Nama Lengkap' : 'Full Name'}</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-10 px-3.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder={isId ? 'Contoh: Budi Pratama' : 'e.g. John Doe'}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>{isId ? 'Alamat Email' : 'Email Address'}</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-10 px-3.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder={isId ? 'nama@perusahaan.com' : 'name@company.com'}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="subject" className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>{isId ? 'Subjek / Judul Kebutuhan' : 'Subject / Topic'}</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full h-10 px-3.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder={isId ? 'Contoh: Konsultasi Arsitektur Web Enterprise' : 'e.g. Enterprise Web Architecture Inquiry'}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-semibold text-foreground/90 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <span>{isId ? 'Rincian Pesan' : 'Message Details'}</span>
                  <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3.5 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={isId ? 'Ceritakan ringkas mengenai latar belakang proyek, fitur yang dibutuhkan, atau tawaran kerja sama Anda...' : 'Briefly describe your project requirements, target timeline, or collaboration details...'}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full h-11 px-5 rounded-lg bg-primary hover:bg-primary/90 text-black font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>{isId ? 'Mengirim Pesan...' : 'Sending Message...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-black" />
                    <span>{isId ? 'Kirim Pesan Sekarang' : 'Send Message Now'}</span>
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground dark:text-zinc-400 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {isId 
                    ? 'Privasi data terjamin. Pesan langsung diterima oleh Eka Syarif Maulana.' 
                    : 'Privacy guaranteed. Messages route directly to Eka Syarif Maulana.'}
                </span>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-zinc-400">
                        {isId ? 'EMAIL UTAMA' : 'PRIMARY EMAIL'}
                      </p>
                      <a 
                        href={`mailto:${emailVal}`} 
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors block truncate"
                      >
                        {emailVal}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(emailVal, 'Email')}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40"
                      aria-label="Copy Email"
                      title={isId ? 'Salin Email' : 'Copy Email'}
                    >
                      {copiedField === 'Email' ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={`mailto:${emailVal}`}
                      className="p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
                      aria-label="Send Email"
                      title={isId ? 'Buka Aplikasi Email' : 'Open Email Client'}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-[#075E54]/20 border border-[#075E54]/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <MessageCircle className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-zinc-400">
                        {isId ? 'WHATSAPP (RESPON TERCEPAT)' : 'WHATSAPP (FASTEST RESPONSE)'}
                      </p>
                      <a 
                        href={`https://wa.me/${cleanPhone}?text=${whatsappGreeting}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-semibold text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors block truncate"
                      >
                        {phoneVal}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(phoneVal, isId ? 'Nomor WhatsApp' : 'WhatsApp Number')}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/40"
                      aria-label="Copy Phone"
                      title={isId ? 'Salin Nomor' : 'Copy Number'}
                    >
                      {copiedField === (isId ? 'Nomor WhatsApp' : 'WhatsApp Number') ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${whatsappGreeting}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 rounded-md bg-[#075E54] hover:bg-[#128C7E] text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-sm"
                      aria-label="Chat WhatsApp"
                      title="Chat via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-zinc-400">
                        {isId ? 'LOKASI & DOMISILI' : 'BASE LOCATION'}
                      </p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {locationVal}
                      </p>
                    </div>
                  </div>
                  {currentTime && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-background border border-border text-muted-foreground dark:text-zinc-300 shrink-0 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-primary" />
                      <span>{currentTime}</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1 border-t border-border/40">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-xs font-medium text-muted-foreground dark:text-zinc-300">
                    <Globe2 className="w-3.5 h-3.5 text-primary" />
                    <span>Remote Worldwide</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background border border-border text-xs font-medium text-muted-foreground dark:text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Hybrid / On-site Ready</span>
                  </span>
                </div>
              </div>
            </div>

            <div ref={mapContainerRef} className="rounded-xl overflow-hidden border border-border/80 h-44 relative group bg-background">
              {isValidMapUrl && showMap ? (
                <>
                  <iframe 
                    key={mapUrl}
                    title="Peta Lokasi Eka Syarif Maulana - Medan, Sumatera Utara"
                    src={safeUrl(mapUrl)}
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full grayscale contrast-125 dark:opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-1.5 text-xs text-white font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Medan, Sumatera Utara</span>
                    </div>
                    <a
                      href="https://maps.google.com/?q=Medan,Sumatera+Utara"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md bg-zinc-900/95 hover:bg-zinc-800 border border-zinc-700 text-[11px] font-semibold text-white flex items-center gap-1 shadow-sm transition-all active:scale-[0.98]"
                    >
                      <span>Buka Maps</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </a>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/40 text-muted-foreground dark:text-zinc-400 text-xs">
                  {isValidMapUrl ? (isId ? "Memuat peta lokasi..." : "Loading location map...") : "Map unavailable"}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border/60">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-zinc-400 mb-3">
                {isId ? 'JARINGAN & REPOSITORI PROFESIONAL' : 'PROFESSIONAL NETWORKS & REPOSITORIES'}
              </p>
              <div className="flex flex-wrap gap-2">
                {normalizedSocialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={safeUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-3 rounded-lg bg-background border border-border/80 hover:border-primary hover:text-primary transition-all flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground dark:text-zinc-300 dark:hover:text-white group active:scale-[0.98]"
                    aria-label={link.platform || 'Social Link'}
                  >
                    <SocialIcon platform={link.platform} icon={(link as any).icon} url={link.url} size={14} />
                    <span className="capitalize">{link.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
