import { useQuery } from '@tanstack/react-query';
import { educationAPI } from '../services/api';
import { useMemo } from 'react';
import { safeJsonParse } from '@/lib/utils';

export const useEducation = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['education'],
    queryFn: educationAPI.getAll,
    initialData: () => {
      const cached = safeJsonParse<any[]>(localStorage.getItem('education_cache'), null as any);
      return cached && cached.length > 0 ? cached : undefined;
    },
  });

  const education = useMemo(() => {
    let raw: any[] = [];
    if (Array.isArray(data)) raw = data;
    else if (data && Array.isArray(data.data)) raw = data.data;

    return [...raw].sort((a: any, b: any) => (Number(a.id) || 0) - (Number(b.id) || 0));
  }, [data]);

  return {
    education,
    isLoading: isLoading && (!education || education.length === 0),
    error,
  };
};
