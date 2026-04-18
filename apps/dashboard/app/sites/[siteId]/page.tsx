import { createServerClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function SiteOverviewPage({ params }: { params: { siteId: string } }) {
  const supabase = createServerClient();
  const { data: site } = await supabase.from('sites').select('*').eq('id', params.siteId).single();
  if (!site) notFound();

  const [{ count: articleCount }, { count: newsCount }, { count: unreadCount }] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('site_id', params.siteId),
    supabase.from('news').select('id', { count: 'exact', head: true }).eq('site_id', params.siteId),
    supabase.from('contact_submissions').select('id', { count: 'exact', head: true })
      .eq('site_id', params.siteId).eq('is_read', false),
  ]);

  const stats = [
    { label: '文章', value: articleCount ?? 0, href: 'content/articles' },
    { label: '最新消息', value: newsCount ?? 0, href: 'content/news' },
    { label: '未讀表單', value: unreadCount ?? 0, href: 'contacts' },
  ];

  const enabledModules = Object.entries(site.module_config as Record<string, { enabled: boolean }>)
    .filter(([, v]) => v.enabled)
    .map(([k]) => k);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">{site.name}</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow"
          >
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h2 className="font-medium text-slate-700 mb-3 text-sm">已啟用模組</h2>
        {enabledModules.length === 0 ? (
          <p className="text-sm text-slate-400">尚未啟用任何模組</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {enabledModules.map((m) => (
              <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-medium text-slate-700 mb-3 text-sm">站台資訊</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="text-slate-400 w-20 shrink-0">Slug</dt>
            <dd className="text-slate-700 font-mono">{site.slug}</dd>
          </div>
          {site.domain && (
            <div className="flex gap-2">
              <dt className="text-slate-400 w-20 shrink-0">Domain</dt>
              <dd className="text-slate-700">{site.domain}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="text-slate-400 w-20 shrink-0">建立時間</dt>
            <dd className="text-slate-700">{new Date(site.created_at).toLocaleDateString('zh-TW')}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
