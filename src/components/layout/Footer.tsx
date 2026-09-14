import { motion } from 'framer-motion';
import { 
  ArrowUp, Heart, ShieldCheck, Cpu, Code2, 
  Globe, FileText, MessageCircle, ExternalLink 
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
    { label: isId ? 'Tentang' : 'About', href: '#about' },
    { label: isId ? 'Proyek' : 'Projects', href: '#projects' },
    { label: isId ? 'Pengalaman' : 'Experience', href: '#experience' },
    { label: isId ? 'Pendidikan' : 'Education', href: '#education' },
    { label: isId ? 'Sertifikasi' : 'Certificates', href: '#certificates' },
    { label: isId ? 'Artikel Blog' : 'Blog Articles', href: '/blog' },
    { label: isId ? 'Kontak' : 'Contact', href: '#contact' },
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
    { label: 'LLMs.txt Manifest', href: '/llms.txt', isExternal: true },
    { label: 'Full Context (llms-full.txt)', href: '/llms-full.txt', isExternal: true },
    { label: 'Sitemap XML', href: '/sitemap.xml', isExternal: true },
    { label: 'Robots.txt', href: '/robots.txt', isExternal: true },
    { label: 'Admin Portal', href: '/admin/login', isExternal: false },
  ];

  const cleanPhone = (profile?.phone || '+6282392115909').replace(/[^0-9]/g, '');

  return (
    <footer className="border-t border-border/80 bg-card/40 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-border/60">
          <div className="lg:col-span-4 space-y-4">
            <a href="#home" className="inline-flex items-center text-2xl font-heading font-extrabold tracking-tight">
              <span className="text-primary">{logoFirstLetter}</span>
              <span>{logoRest}</span>
              <span className="text-primary">.</span>
            </a>

            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Senior Fullstack Developer & AI Engineer
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {isId 
                ? 'Mendedikasikan kompetensi rekayasa perangkat lunak untuk membangun platform digital berperforma tinggi, aman, dan berorientasi pada pertumbuhan bisnis nyata.'
                : 'Engineering robust, scalable web architectures, modern cloud pipelines, and intelligent AI solutions tailored for real-world impact.'}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{isId ? 'Konsultasi WhatsApp' : 'WhatsApp Chat'}</span>
              </a>

              {profile?.resumeUrl && (
                <a
                  href={safeUrl(profile.resumeUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3.5 rounded-lg bg-background border border-border/80 hover:border-primary text-foreground text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>{isId ? 'Unduh Resume' : 'View Resume'}</span>
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-primary" />
              <span>{isId ? 'Navigasi Portfolio' : 'Navigation'}</span>
            </h4>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
              {navLinks.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith('#') ? (
                    <a 
                      href={item.href} 
                      className="text-muted-foreground hover:text-primary transition-colors block py-0.5"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link 
                      to={item.href} 
                      className="text-muted-foreground hover:text-primary transition-colors block py-0.5"
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
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {focusAreas.map((area) => (
                <li key={area} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary/70 shrink-0" />
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
            <ul className="space-y-1.5 text-xs">
              {devResources.map((res) => (
                <li key={res.label}>
                  {res.isExternal ? (
                    <a
                      href={res.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 py-0.5"
                    >
                      <span>{res.label}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  ) : (
                    <Link
                      to={res.href}
                      className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 py-0.5"
                    >
                      <span>{res.label}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="py-6 border-b border-border/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/50 border border-border/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cloudflare Global Anycast Edge</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/50 border border-border/40">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>React 19 • TypeScript • Neon Postgres</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/50 border border-border/40">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>99.9% Uptime SLA</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {normalizedSocialLinks.map((link) => (
              <a
                key={link.id}
                href={safeUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-background border border-border/60 hover:border-primary hover:text-primary flex items-center justify-center transition-all text-muted-foreground"
                aria-label={link.platform || 'Social Link'}
              >
                <SocialIcon platform={link.platform} icon={(link as any).icon} url={link.url} size={14} />
              </a>
            ))}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="text-center sm:text-left">
            © {currentYear} <span className="font-semibold text-foreground">{profile?.fullName || 'Eka Syarif Maulana, S.Kom'}</span>. {isId ? 'Hak Cipta Dilindungi.' : 'All rights reserved.'}
          </p>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-[11px]">
              {t('footer.made_with')}{' '}
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              {isId ? 'di Medan, Indonesia 🇮🇩' : 'in Medan, Indonesia 🇮🇩'}
            </span>

            <button
              type="button"
              onClick={scrollToTop}
              className="h-8 px-2.5 rounded-lg bg-background border border-border/80 hover:border-primary text-foreground text-[11px] font-semibold inline-flex items-center gap-1 transition-all active:scale-[0.98] shadow-xs"
              aria-label="Kembali ke atas"
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
