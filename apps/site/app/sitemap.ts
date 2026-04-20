import type { MetadataRoute } from 'next';
import { getSiteConfig } from '@/lib/config';
import { getPublishedArticles, createServerClient } from '@siteforge/db';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteConfig();
  const baseUrl = site.domain ? `https://${site.domain}` : '';
  const supabase = createServerClient();
  const articles = await getPublishedArticles(supabase, site.id);

  return [
    { url: baseUrl, lastModified: new Date() },
    ...articles.map((a) => ({
      url: `${baseUrl}/articles/${a.slug}`,
      lastModified: new Date(a.updated_at ?? a.published_at ?? new Date()),
    })),
  ];
}
