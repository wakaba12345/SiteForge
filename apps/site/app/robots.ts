import type { MetadataRoute } from 'next';
import { getSiteConfig } from '@/lib/config';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteConfig();
  const baseUrl = site.domain ? `https://${site.domain}` : '';
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
