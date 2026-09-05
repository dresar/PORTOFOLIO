import { useQuery } from '@tanstack/react-query';
import { experienceAPI } from '../services/api';
import { useMemo } from 'react';
import { safeJsonParse } from '@/lib/utils';

export const useExperience = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['experience'],
    queryFn: experienceAPI.getAll,
    initialData: () => {
      const cached = safeJsonParse<any[]>(localStorage.getItem('experience_cache'), null as any);
      return cached && cached.length > 0 ? cached : undefined;
    },
  });

  const experiences = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  return {
    experiences,
    isLoading: isLoading && (!experiences || experiences.length === 0),
    error,
  };
};
