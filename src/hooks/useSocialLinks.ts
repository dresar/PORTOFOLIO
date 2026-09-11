import { useQuery } from '@tanstack/react-query';
import { socialLinksAPI } from '../services/api';
import { safeJsonParse } from '@/lib/utils';

export const DEFAULT_SOCIAL_LINKS = [
  { id: 1, platform: 'GitHub', url: 'https://github.com/dresar', icon: 'github' },
  { id: 4, platform: 'Instagram', url: 'https://www.instagram.com/arif_ex21', icon: 'instagram' },
  { id: 6, platform: 'LinkedIn', url: 'https://www.linkedin.com/in/arifex21', icon: '' },
  { id: 9, platform: 'WhatsApp', url: 'https://wa.me/6282392115909', icon: '' },
  { id: 10, platform: 'TikTok', url: 'https://www.tiktok.com/@arif.ex21', icon: '' },
  { id: 11, platform: 'Telegram', url: 'https://t.me/Arif_ex21', icon: '' },
];

export const useSocialLinks = () => {
  const { data: socialLinks, isLoading, error } = useQuery({
    queryKey: ['social-links'],
    queryFn: socialLinksAPI.getAll,
    initialData: () => {
      const cached = safeJsonParse<any[]>(localStorage.getItem('social_links_cache'), null as any);
      return cached && cached.length > 0 ? cached : DEFAULT_SOCIAL_LINKS;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    socialLinks: (socialLinks && socialLinks.length > 0) ? socialLinks : DEFAULT_SOCIAL_LINKS,
    isLoading: false,
    error,
  };
};
