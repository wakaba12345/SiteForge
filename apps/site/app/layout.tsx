import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/config';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/modules/Header';
import './globals.css';

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

  const navLinks = [
    { label: '首頁', href: '/' },
    ...(mc?.articles?.enabled ? [{ label: '文章', href: '/articles' }] : []),
    ...(mc?.news?.enabled ? [{ label: '最新消息', href: '/news' }] : []),
    ...(mc?.contact?.enabled ? [{ label: '聯絡我們', href: '/contact' }] : []),
  ];

  return (
    <html lang={site.seo_config.language ?? 'zh-TW'}>
      <head>
        {site.seo_config.favicon && <link rel="icon" href={site.seo_config.favicon} />}
      </head>
      <body>
        <ThemeProvider theme={site.theme_config}>
          <Header siteName={site.name} links={navLinks} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
