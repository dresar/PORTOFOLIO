import { useQuery } from '@tanstack/react-query';
import { blogPostsAPI, blogCategoriesAPI } from '@/services/api';
import { useMemo } from 'react';
import staticPosts from '@/data/blogPosts.json';

export function useBlogPosts() {
  const posts = useMemo(() => {
    return staticPosts as any[];
  }, []);

  return {
    posts,
    isLoading: false,
    isError: false,
    error: null,
  };
}

export function useBlogPostBySlug(slug: string) {
  const staticItem = (staticPosts as any[]).find((p: any) => p.slug === slug);

  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (staticItem) return staticItem;
      try {
        const data = await blogPostsAPI.getBySlug(slug);
        if (data && data.slug === slug) return data;
      } catch {}
      if (staticItem) return staticItem;
      throw new Error('Post not found');
    },
    initialData: staticItem,
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

