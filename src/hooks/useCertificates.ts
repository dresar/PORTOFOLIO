import { useQuery } from '@tanstack/react-query';
import { certificatesAPI } from '../services/api';
import { useMemo } from 'react';
import { safeJsonParse } from '@/lib/utils';

export const useCertificates = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['certificates'],
    queryFn: certificatesAPI.getAll,
    initialData: () => {
      const cached = safeJsonParse<any[]>(localStorage.getItem('certificates_cache'), null as any);
      return cached && cached.length > 0 ? cached : undefined;
    },
  });

  const certificates = useMemo(() => {
    let raw: any[] = [];
    if (Array.isArray(data)) raw = data;
    else if (data && Array.isArray(data.data)) raw = data.data;

    return [...raw].sort((a: any, b: any) => (Number(a.id) || 0) - (Number(b.id) || 0));
  }, [data]);

  return {
    certificates,
    isLoading: isLoading && (!certificates || certificates.length === 0),
    error,
    refetch,
  };
};
