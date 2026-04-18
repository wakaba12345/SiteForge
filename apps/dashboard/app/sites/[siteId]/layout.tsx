import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';

const NAV = [
  { href: '', label: '概覽' },
  { href: '/modules', label: '功能模組' },
  { href: '/theme', label: '主題風格' },
  { href: '/content/articles', label: '文章' },
  { href: '/content/news', label: '最新消息' },
  { href: '/content/marquee', label: '跑馬燈' },
  { href: '/contacts', label: '聯絡表單' },
  { href: '/settings', label: '設定' },
];

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { siteId: string };
}) {
  const supabase = createServerClient();
  const { data: site } = await supabase
    .from('sites')
    .select('id, name, slug, status')
    .eq('id', params.siteId)
    .single();

  if (!site) notFound();

  const base = `/sites/${params.siteId}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
        <Link href="/sites" className="text-sm text-slate-400 hover:text-slate-600">← 所有站台</Link>
        <span className="text-slate-300">|</span>
        <span className="font-semibold text-slate-900">{site.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          site.status === 'active' ? 'bg-green-100 text-green-700' :
          site.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
          'bg-slate-100 text-slate-500'
        }`}>
          {site.status === 'active' ? '上線' : site.status === 'paused' ? '暫停' : '草稿'}
        </span>
      </header>

      <div className="flex flex-1">
        <nav className="w-48 shrink-0 bg-white border-r border-slate-200 py-4">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={`${base}${href}`}
              className="block px-5 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-slate-200 mt-4 pt-4 px-5">
            <Link
              href={`${base}/preview`}
              className="block text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              預覽站台 →
            </Link>
          </div>
        </nav>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
