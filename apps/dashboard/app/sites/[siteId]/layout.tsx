import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { SiteNav } from './SiteNav';

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
        <SiteNav base={base} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
