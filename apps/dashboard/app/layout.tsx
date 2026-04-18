import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'SiteForge Dashboard' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
