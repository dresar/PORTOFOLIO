import { motion } from 'framer-motion';
import { 
  ArrowUp, Heart, ShieldCheck, Cpu, Code2, 
  Globe, FileText, MessageCircle, ExternalLink,
  Database, Zap, CheckCircle2, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { safeUrl } from '@/lib/utils';

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const isId = i18n.language === 'id';
  const currentYear = new Date().getFullYear();
  const { profile } = useProfile();
  const { settings } = useSettings();
  const { socialLinks } = useSocialLinks();
  const normalizedSocialLinks = Array.isArray(socialLinks) ? socialLinks : [];

  const logoText = settings?.siteName || profile?.fullName?.split(' ')[0] || 'Eka';
  const logoFirstLetter = logoText.charAt(0);
  const logoRest = logoText.slice(1);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: isId ? 'Beranda' : 'Home', href: '#home' },
    { label: isId ? 'Tentang Saya' : 'About Me', href: '#about' },
    { label: isId ? 'Portofolio Proyek' : 'Projects', href: '#projects' },
    { label: isId ? 'Pengalaman Kerja' : 'Experience', href: '#experience' },
    { label: isId ? 'Pendidikan' : 'Education', href: '#education' },
    { label: isId ? 'Sertifikasi' : 'Certificates', href: '#certificates' },
    { label: isId ? 'Artikel Blog' : 'Blog Articles', href: '/blog' },
    { label: isId ? 'Hubungi Saya' : 'Contact Me', href: '#contact' },
  ];

  const focusAreas = [
    'Fullstack Web Architecture',
    'Mobile Application Development',
    'Cloudflare Edge & Serverless',
    'AI & LLM Gateway Systems',
    'PostgreSQL & High-Traffic APIs',
    'Enterprise System Analysis',
  ];

  const devResources = [
    { label: 'LLMs.txt Manifest', href: '/llms.txt', badge: 'AI', isExternal: true },
    { label: 'Full Context (llms-full.txt)', href: '/llms-full.txt', badge: 'LLM', isExternal: true },
    { label: 'Sitemap XML', href: '/sitemap.xml', badge: 'SEO', isExternal: true },
    { label: 'Robots Protocol', href: '/robots.txt', badge: 'BOT', isExternal: true },
    { label: 'Admin Portal', href: '/admin/login', badge: 'AUTH', isExternal: false },
  ];

  const cleanPhone = (profile?.phone || '+6282392115909').replace(/[^0-9]/g, '');

  const whatsappGreeting = encodeURIComponent(
    isId 
      ? 'Halo Mas Eka Syarif, saya tertarik untuk mendiskusikan peluang proyek arsitektur digital.'
      : 'Hello Eka Syarif, I would like to discuss a digital engineering project opportunity.'
  );

  return (
    <footer className="border-t border-border/80 bg-card/60 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl pt-16 pb-12">
        <div className="mb-14 p-7 sm:p-9 rounded-2xl bg-gradient-to-br from-card via-muted/20 to-card border border-border/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/40 transition-colors relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>{isId ? 'SIAP UNTUK TANTANGAN REKAYASA BARU' : 'READY FOR NEW ENGINEERING CHALLENGES'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold tracking-tight text-foreground">
              {isId ? 'Punya Proyek yang Membutuhkan Sentuhan Ahli?' : 'Have a Project That Needs Expert Engineering?'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              {isId 
                ? 'Mari konsultasikan kebutuhan arsitektur cloud, sistem AI, atau aplikasi web & mobile Anda langsung bersama Eka Syarif Maulana.'
                : 'Let’s architect scalable cloud solutions, custom AI pipelines, or high-performance web & mobile applications tailored to your business.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${cleanPhone}?text=${whatsappGreeting}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-5 rounded-lg bg-[#075E54] hover:bg-[#128C7E] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isId ? 'Konsultasi WhatsApp' : 'WhatsApp Chat'}</span>
            </a>

            <a
              href="#projects"
              className="h-11 px-5 rounded-lg bg-background border border-border/80 hover:border-primary text-foreground text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
            >
              <span>{isId ? 'Lihat Portofolio' : 'View Projects'}</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-border/60">
          <div className="lg:col-span-4 space-y-4">
            <a href="#home" className="inline-flex items-center text-2xl font-heading font-extrabold tracking-tight">
              <span className="text-primary">{logoFirstLetter}</span>
              <span>{logoRest}</span>
              <span className="text-primary">.</span>
            </a>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 border border-border/60 text-xs font-semibold text-foreground">
              <Code2 className="w-3.5 h-3.5 text-primary" />
              <span>Senior Fullstack Developer & AI Engineer</span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {isId 
                ? 'Mendedikasikan kompetensi rekayasa perangkat lunak untuk membangun platform digital berperforma tinggi, aman, dan berorientasi pada pertumbuhan bisnis nyata.'
                : 'Engineering robust, scalable web architectures, modern cloud pipelines, and intelligent AI solutions tailored for real-world impact.'}
            </p>

            <div className="pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{isId ? 'Seluruh Sistem & API Berjalan Normal' : 'All Systems & APIs Operational'}</span>
              </div>
            </div>

            {profile?.resumeUrl && (
              <div className="pt-1">
                <a
                  href={safeUrl(profile.resumeUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3.5 rounded-lg bg-background border border-border/80 hover:border-primary text-foreground text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-xs active:scale-[0.98]"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>{isId ? 'Unduh Resume Lengkap (PDF)' : 'Download Full Resume (PDF)'}</span>
                </a>
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-primary" />
              <span>{isId ? 'Navigasi Portfolio' : 'Portfolio Navigation'}</span>
            </h4>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs">
              {navLinks.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith('#') ? (
                    <a 
                      href={item.href} 
                      className="text-zinc-400 hover:text-primary transition-colors block py-0.5 font-medium"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link 
                      to={item.href} 
                      className="text-zinc-400 hover:text-primary transition-colors block py-0.5 font-medium"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>{isId ? 'Fokus Engineering' : 'Engineering Focus'}</span>
            </h4>
            <ul className="space-y-2 text-xs text-zinc-300">
              {focusAreas.map((area) => (
                <li key={area} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>{isId ? 'Indeks & Dev' : 'Dev Index'}</span>
            </h4>
            <ul className="space-y-2 text-xs">
              {devResources.map((res) => (
                <li key={res.label}>
                  {res.isExternal ? (
                    <a
                      href={res.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-primary transition-colors flex items-center justify-between py-0.5 font-medium group"
                    >
                      <span className="truncate">{res.label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-zinc-300 group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0 border border-border/50">
                        {res.badge}
                      </span>
                    </a>
                  ) : (
                    <Link
                      to={res.href}
                      className="text-zinc-400 hover:text-primary transition-colors flex items-center justify-between py-0.5 font-medium group"
                    >
                      <span className="truncate">{res.label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-zinc-300 group-hover:text-primary group-hover:bg-primary/10 transition-colors shrink-0 border border-border/50">
                        {res.badge}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="py-6 border-b border-border/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 border border-border/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cloudflare Anycast Global Edge</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 border border-border/60">
              <Cpu className="w-4 h-4 text-primary" />
              <span>React 19 • TypeScript • Neon Postgres</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 border border-border/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>99.9% Production SLA</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {normalizedSocialLinks.map((link) => (
              <a
                key={link.id}
                href={safeUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-background border border-border/60 hover:border-primary hover:text-primary flex items-center justify-center transition-all text-zinc-400 hover:text-white active:scale-[0.98]"
                aria-label={link.platform || 'Social Link'}
              >
                <SocialIcon platform={link.platform} icon={(link as any).icon} url={link.url} size={14} />
              </a>
            ))}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p className="text-center sm:text-left">
            © {currentYear} <span className="font-semibold text-foreground">{profile?.fullName || 'Eka Syarif Maulana, S.Kom'}</span>. {isId ? 'Hak Cipta Dilindungi.' : 'All rights reserved.'}
          </p>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300">
              {t('footer.made_with')}{' '}
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              {isId ? 'di Medan, Indonesia 🇮🇩' : 'in Medan, Indonesia 🇮🇩'}
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              className="h-8 px-3 rounded-lg bg-background border border-border/80 hover:border-primary text-foreground text-xs font-semibold inline-flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-xs"
              aria-label={isId ? 'Kembali ke atas' : 'Back to top'}
            >
              <span>{isId ? 'Ke Atas' : 'Top'}</span>
              <ArrowUp className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
