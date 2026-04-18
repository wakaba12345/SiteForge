import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/config';
import { ThemeProvider } from '@/components/ThemeProvider';
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

  return (
    <html lang={site.seo_config.language ?? 'zh-TW'}>
      <head>
        {site.seo_config.favicon && <link rel="icon" href={site.seo_config.favicon} />}
      </head>
      <body>
        <ThemeProvider theme={site.theme_config}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
