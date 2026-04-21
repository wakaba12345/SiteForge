import type { Metadata } from 'next';
import { cache } from 'react';
import { getSiteConfig } from '@/lib/config';
import { getPublishedPages, createServerClient } from '@siteforge/db';
import { Header } from '@/components/modules/Header';
import './globals.css';

const fetchNavPages = cache(async (siteId: string) => {
  const supabase = createServerClient();
  const pages = await getPublishedPages(supabase, siteId);
  return pages.filter((p) => p.show_in_nav);
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig();
  return {
    title: site.seo_config.title || site.name,
    description: site.seo_config.description || undefined,
    openGraph: site.seo_config.ogImage ? { images: [site.seo_config.ogImage] } : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteConfig();
  const mc = site.module_config as any;
  const theme = site.theme_config;
  const navPages = await fetchNavPages(site.id);

  const navLinks = [
    { label: '首頁', href: '/' },
    ...navPages.map((p) => ({ label: p.nav_label ?? p.title, href: `/${p.slug}` })),
    ...(mc?.articles?.enabled ? [{ label: '文章', href: '/articles' }] : []),
    ...(mc?.news?.enabled ? [{ label: '最新消息', href: '/news' }] : []),
  ];

  const cssVars = [
    `--color-primary:${theme.colors.primary}`,
    `--color-accent:${theme.colors.accent}`,
    `--color-bg:${theme.colors.background}`,
    `--color-surface:${theme.colors.surface}`,
    `--color-text:${theme.colors.text}`,
    `--color-text-secondary:${theme.colors.textSecondary}`,
    `--color-border:${theme.colors.border}`,
    `--font-heading:'${theme.typography.headingFont}', sans-serif`,
    `--font-body:'${theme.typography.bodyFont}', sans-serif`,
    `--font-size-base:${theme.typography.baseFontSize}`,
    `--font-weight-heading:${theme.typography.headingWeight}`,
    `--line-height:${theme.typography.lineHeight}`,
    `--max-width:${theme.layout.maxWidth}`,
    `--border-radius:${theme.layout.borderRadius}`,
    `--spacing:${theme.layout.spacing}`,
  ].join(';');

  const fontFamilies = [
    ...new Set([theme.typography.headingFont, theme.typography.bodyFont]),
  ]
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join('&');

  return (
    <html lang={site.seo_config.language ?? 'zh-TW'}>
      <head>
        {site.seo_config.favicon && <link rel="icon" href={site.seo_config.favicon} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`}
        />
        <style dangerouslySetInnerHTML={{ __html: `:root{${cssVars}}` }} />
      </head>
      <body>
        <Header siteName={site.name} links={navLinks} />
        {children}
      </body>
    </html>
  );
}
