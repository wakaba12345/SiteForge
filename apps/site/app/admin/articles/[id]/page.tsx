import { isAuthenticated } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import { getAdminSite } from '@/lib/admin-site';
import { supabase } from '@/lib/supabase';
import ArticleForm from '../ArticleForm';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) redirect('/admin/login');
  const aiEnabled = !!process.env.ANTHROPIC_API_KEY;
  const site = await getAdminSite();
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .eq('site_id', site.id)
    .single();
  if (!article) redirect('/admin');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0d1f3c]">編輯文章</h1>
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700">← 返回列表</a>
      </div>
      <ArticleForm
        aiEnabled={aiEnabled}
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          status: article.status,
          category: article.category ?? '',
          tags: article.tags ?? [],
          cover_image: article.cover_image ?? '',
          excerpt: article.excerpt ?? '',
          content: article.content,
          published_at: article.published_at
            ? new Date(article.published_at).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          seo_title: article.seo_title ?? '',
          seo_description: article.seo_description ?? '',
          sort_order: article.sort_order ?? 0,
        }}
      />
    </div>
  );
}
