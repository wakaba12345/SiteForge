import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import { getSitesByOwner } from '@siteforge/db';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-slate-100 text-slate-600',
};

export default async function SitesPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const sites = user ? await getSitesByOwner(supabase as any, user.id) : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">SiteForge</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{user?.email}</span>
          <form action="/api/auth/signout" method="POST">
            <button className="text-sm text-slate-500 hover:text-slate-700">登出</button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">我的站台</h2>
          <Link
            href="/sites/new"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 新增站台
          </Link>
        </div>

        {sites.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-base mb-2">還沒有站台</p>
            <p className="text-sm">點擊「新增站台」開始建立您的第一個站台</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow block"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{site.name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[site.status]}`}>
                    {site.status === 'active' ? '上線' : site.status === 'paused' ? '暫停' : '草稿'}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{site.domain ?? `/${site.slug}`}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(site.updated_at).toLocaleDateString('zh-TW')} 更新
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
