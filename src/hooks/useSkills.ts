import { useQuery } from '@tanstack/react-query';
import { skillsAPI } from '../services/api';
import { useMemo } from 'react';
import { safeJsonParse } from '@/lib/utils';

export const useSkills = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['skills'],
    queryFn: skillsAPI.getAll,
    initialData: () => {
      const cached = safeJsonParse<any[]>(localStorage.getItem('skills_cache'), null as any);
      return cached && cached.length > 0 ? cached : undefined;
    },
    retry: 0,
    staleTime: 300000,
  });

  const skills = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  return {
    skills,
    isLoading: isLoading && (!skills || skills.length === 0),
    isError,
  };
};
