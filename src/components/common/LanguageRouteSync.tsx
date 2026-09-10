import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const LanguageRouteSync = () => {
  const { lang } = useParams<{ lang?: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!lang) return;

    const normalized = lang.toLowerCase();
    if (normalized === 'id' || normalized === 'en') {
      if (i18n.language !== normalized) {
        i18n.changeLanguage(normalized);
        localStorage.setItem('i18nextLng', normalized);
      }
    } else {
      // If it looks like a static file (e.g. sitemap.xml, robots.txt), bypass SPA redirect
      if (normalized.includes('.') || normalized === 'sitemap' || normalized === 'robots' || normalized === 'llms') {
        window.location.replace(location.pathname);
        return;
      }
      // Invalid language prefix, redirect to default /id
      navigate('/id', { replace: true });
    }
  }, [lang, i18n, navigate, location.pathname]);

  return <Outlet />;
};

export const RootLanguageRedirect = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('i18nextLng') || i18n.language || 'id';
    const targetLang = saved.startsWith('en') ? 'en' : 'id';
    navigate(`/${targetLang}${location.search}${location.hash}`, { replace: true });
  }, [i18n.language, location.search, location.hash, navigate]);

  return null;
};

export const LocalizedHomeRedirect = () => {
  const { lang } = useParams<{ lang?: string }>();
  const normalized = (lang || '').toLowerCase();
  const target = (normalized === 'en' || normalized === 'id') ? `/${normalized}` : '/id';
  return <Navigate to={target} replace />;
};
