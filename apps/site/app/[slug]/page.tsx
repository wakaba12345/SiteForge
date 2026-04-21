import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cache } from 'react';
import { getPageBySlug, createServerClient } from '@siteforge/db';
import { getSiteConfig } from '@/lib/config';
import { PageRenderer } from '@/components/PageRenderer';

export const revalidate = 3600;

const RESERVED_SLUGS = new Set([
  'articles',
  'news',
  'admin',
  'api',
  'sitemap.xml',
  'robots.txt',
  '_next',
]);

const fetchPage = cache(async (siteId: string, slug: string) => {
  const supabase = createServerClient();
  return getPageBySlug(supabase, siteId, slug);
});

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  if (RESERVED_SLUGS.has(params.slug)) return {};
  const site = await getSiteConfig();
  const page = await fetchPage(site.id, params.slug);
  if (!page) return {};
  return {
    title: page.seo?.title || `${page.title} | ${site.name}`,
    description: page.seo?.description || undefined,
    openGraph: page.seo?.ogImage ? { images: [page.seo.ogImage] } : undefined,
  };
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  if (RESERVED_SLUGS.has(params.slug)) notFound();
  const site = await getSiteConfig();
  const page = await fetchPage(site.id, params.slug);
  if (!page) notFound();
  return <PageRenderer sections={page.sections} siteId={site.id} />;
}
