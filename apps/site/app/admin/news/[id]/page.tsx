import { isAuthenticated } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { getAdminSite } from '@/lib/admin-site';
import { supabase } from '@/lib/supabase';
import NewsForm from '../NewsForm';

export const dynamic = 'force-dynamic';

export default async function EditNewsPage({ params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) redirect('/admin/login');
  const site = await getAdminSite();
  const { data: item } = await supabase
    .from('news').select('*').eq('id', params.id).eq('site_id', site.id).single();
  if (!item) redirect('/admin/news');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0d1f3c]">編輯消息</h1>
        <a href="/admin/news" className="text-sm text-gray-500 hover:text-gray-700">← 返回列表</a>
      </div>
      <NewsForm
        initial={{
          id: item.id,
          title: item.title,
          content: item.content ?? '',
          url: item.url ?? '',
          category: item.category ?? '',
          is_pinned: item.is_pinned,
          status: item.status,
          published_at: new Date(item.published_at).toISOString().slice(0, 10),
          sort_order: item.sort_order ?? 0,
        }}
      />
    </div>
  );
}
