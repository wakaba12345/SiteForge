import { isAuthenticated } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { getAdminSite } from '@/lib/admin-site';
import { supabase } from '@/lib/supabase';
import ArticlesClient from './ArticlesClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  if (!(await isAuthenticated())) redirect('/admin/login');
  const site = await getAdminSite();

  const [{ count: totalArticles }, { count: publishedArticles }, { count: totalNews }, { count: totalMarquee }] =
    await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('site_id', site.id),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('site_id', site.id).eq('status', 'published'),
      supabase.from('news').select('*', { count: 'exact', head: true }).eq('site_id', site.id),
      supabase.from('marquee_items').select('*', { count: 'exact', head: true }).eq('site_id', site.id),
    ]);

  const stats = [
    { label: '全部文章', value: totalArticles ?? 0 },
    { label: '已發布', value: publishedArticles ?? 0 },
    { label: '草稿', value: (totalArticles ?? 0) - (publishedArticles ?? 0) },
    { label: '最新消息', value: totalNews ?? 0 },
    { label: '跑馬燈', value: totalMarquee ?? 0 },
  ];

  return (
    <div>
      <div className="mb-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-white p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#0d1f3c]">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0d1f3c]">文章管理</h1>
        <a
          href="/admin/articles/new"
          className="rounded bg-[#c9a84c] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8973f]"
        >
          + 新增文章
        </a>
      </div>
      <ArticlesClient />
    </div>
  );
}
