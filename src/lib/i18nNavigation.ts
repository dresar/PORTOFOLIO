import i18n from '@/i18n';

export const getCurrentLang = (): 'id' | 'en' => {
  return i18n.language === 'en' ? 'en' : 'id';
};

export const getLocalizedPath = (path: string, lang?: string): string => {
  const currentLang = lang || getCurrentLang();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (/^\/(id|en)(\/.*)?$/.test(cleanPath)) {
    return cleanPath.replace(/^\/(id|en)/, `/${currentLang}`);
  }

  return `/${currentLang}${cleanPath === '/' ? '' : cleanPath}`;
};
