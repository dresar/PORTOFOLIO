import { useQuery } from '@tanstack/react-query';
import { profileAPI } from '../services/api';
import { safeJsonParse } from '@/lib/utils';

export const useProfile = () => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: profileAPI.get,
    initialData: () => safeJsonParse(localStorage.getItem('profile_cache'), undefined),
    retry: false, // Don't retry if failed, just show fallback
    refetchOnWindowFocus: false,
  });

  return {
    profile,
    isLoading: isLoading && !profile, // If we have profile cache, we are not loading
    error,
  };
};
