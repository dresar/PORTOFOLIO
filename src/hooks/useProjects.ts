import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '@/services/api';
import { useMemo } from 'react';
import { safeJsonParse } from '@/lib/utils';

export function useProjects() {
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll({ limit: 200 } as any),
    initialData: () => {
      const cached = safeJsonParse<any[]>(localStorage.getItem('projects_cache_v3'), null as any);
      return cached && cached.length > 0 ? cached : undefined;
    },
  });

  const projects = useMemo(() => {
    const data = projectsQuery.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  }, [projectsQuery.data]);

  return {
    projects,
    isLoading: projectsQuery.isLoading && (!projects || projects.length === 0),
    isError: projectsQuery.isError,
    error: projectsQuery.error,
  };
}

export function useProject(idOrSlug: number | string | undefined) {
  return useQuery({
    queryKey: ['project', idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) return null;
      const isNum = !isNaN(Number(idOrSlug));
      if (isNum) {
        return projectsAPI.getById(Number(idOrSlug));
      }
      return projectsAPI.getOne(idOrSlug);
    },
    enabled: !!idOrSlug,
  });
}
