import { MetadataRoute } from 'next';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fauzan-alhafizh.dev';

  let projectEntries: MetadataRoute.Sitemap = [];
  try {
    const allProjects = await db
      .select({ slug: projects.slug, updatedAt: projects.updatedAt })
      .from(projects)
      .where(eq(projects.isPublished, true));

    projectEntries = allProjects.map((p) => ({
      url: `${baseUrl}/#projects`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap query error:', error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...projectEntries,
  ];
}
