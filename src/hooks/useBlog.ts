import { useQuery } from '@tanstack/react-query';
import { blogPostsAPI, blogCategoriesAPI } from '@/services/api';
import { useMemo } from 'react';
import staticPosts from '@/data/blogPosts.json';

export function useBlogPosts() {
  const postsQuery = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      try {
        const res = await blogPostsAPI.getAll();
        const items = Array.isArray(res) ? res : (res && Array.isArray((res as any).data) ? (res as any).data : []);
        if (items && items.length > 0) return items;
      } catch (err) {
        console.warn('API error fetching blog posts, using static fallback', err);
      }
      return staticPosts as any[];
    },
    initialData: staticPosts as any[],
  });

  const posts = useMemo(() => {
    const data = postsQuery.data;
    let list: any[] = [];
    if (Array.isArray(data)) list = data;
    else if (data && Array.isArray((data as any).data)) list = (data as any).data;
    else list = staticPosts as any[];

    // Ensure we ONLY show valid Inka.tech educational articles (filter out any old legacy posts)
    const validSlugs = new Set((staticPosts as any[]).map((p: any) => p.slug));
    const filtered = list.filter((p: any) => validSlugs.has(p.slug));
    return filtered.length > 0 ? filtered : (staticPosts as any[]);
  }, [postsQuery.data]);

  return {
    posts,
    isLoading: false,
    isError: false,
    error: null,
  };
}

export function useBlogPostBySlug(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      try {
        const data = await blogPostsAPI.getBySlug(slug);
        if (data && data.slug === slug) return data;
      } catch {
        // fallback
      }
      const found = (staticPosts as any[]).find((p: any) => p.slug === slug);
      if (found) return found;
      throw new Error('Post not found');
    },
    initialData: () => (staticPosts as any[]).find((p: any) => p.slug === slug),
    enabled: !!slug,
  });
}

export function useBlogCategories() {
  const categoriesQuery = useQuery({
    queryKey: ['blog-categories'],
    queryFn: blogCategoriesAPI.getAll,
  });

  const categories = useMemo(() => {
    const data = categoriesQuery.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [
      { id: 1, name: 'Cybersecurity & Privasi', slug: 'cybersecurity' },
      { id: 2, name: 'Kecerdasan Buatan (AI)', slug: 'ai' },
      { id: 3, name: 'Hardware & Gadget Care', slug: 'hardware' },
      { id: 4, name: 'Tips & Trik Produktivitas', slug: 'tips' }
    ];
  }, [categoriesQuery.data]);

  return {
    categories,
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
  };
}

