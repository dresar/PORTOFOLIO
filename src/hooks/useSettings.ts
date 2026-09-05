import { useQuery } from '@tanstack/react-query';
import { siteSettingsAPI } from '../services/api';
import { safeJsonParse } from '@/lib/utils';

export const useSettings = () => {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: siteSettingsAPI.get,
    initialData: () => safeJsonParse(localStorage.getItem('settings_cache'), undefined),
    retry: false, // Don't retry if failed
    refetchOnWindowFocus: false,
  });

  return {
    settings,
    isLoading: isLoading && !settings,
    error,
  };
};
