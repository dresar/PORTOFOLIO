import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fauzan-alhafizh.dev';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/login'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
