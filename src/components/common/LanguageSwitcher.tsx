import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const isEn = i18n.language === 'en';

  const toggleLanguage = () => {
    const nextLang = isEn ? 'id' : 'en';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('i18nextLng', nextLang);

    const pathname = location.pathname;
    const match = pathname.match(/^\/(id|en)(\/.*)?$/);
    if (match) {
      const rest = match[2] || '';
      navigate(`/${nextLang}${rest}${location.search}${location.hash}`);
    } else if (pathname === '/') {
      navigate(`/${nextLang}${location.search}${location.hash}`);
    } else {
      navigate(`/${nextLang}${pathname}${location.search}${location.hash}`);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="relative inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary/80 text-foreground transition-all duration-200 active:scale-95 cursor-pointer select-none"
      title={isEn ? 'Klik untuk beralih ke Bahasa Indonesia' : 'Click to switch to English'}
      aria-label={isEn ? 'Switch to Indonesian language' : 'Ganti ke Bahasa Indonesia'}
    >
      <Globe className="h-3.5 w-3.5 text-primary" />
      <div className="flex items-center text-[11px] font-bold tracking-wider">
        <span className={!isEn ? 'text-primary' : 'text-foreground/80 font-medium'}>ID</span>
        <span className="mx-0.5 text-foreground/50 font-normal">/</span>
        <span className={isEn ? 'text-primary' : 'text-foreground/80 font-medium'}>EN</span>
      </div>
    </button>
  );
};
