import { useQuery } from '@tanstack/react-query';
import { socialLinksAPI } from '../services/api';
import { safeJsonParse } from '@/lib/utils';

export const useSocialLinks = () => {
  const { data: socialLinks, isLoading, error } = useQuery({
    queryKey: ['social-links'],
    queryFn: socialLinksAPI.getAll,
    initialData: () => {
      const cached = safeJsonParse<any[]>(localStorage.getItem('social_links_cache'), null as any);
      return cached && cached.length > 0 ? cached : undefined;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    socialLinks: socialLinks || [],
    isLoading: isLoading && (!socialLinks || socialLinks.length === 0),
    error,
  };
};
