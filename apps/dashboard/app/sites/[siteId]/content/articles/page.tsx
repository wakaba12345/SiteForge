import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import { getAllArticles } from '@siteforge/db';

export default async function ArticlesPage({ params }: { params: { siteId: string } }) {
  const supabase = createServerClient();
  const articles = await getAllArticles(supabase as any, params.siteId);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">文章</h1>
        <Link
          href={`/sites/${params.siteId}/content/articles/new`}
          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + 新增文章
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-sm text-slate-400">尚無文章</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/sites/${params.siteId}/content/articles/${article.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-medium text-slate-900 text-sm">{article.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString('zh-TW')
                    : '未發布'}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                article.status === 'published' ? 'bg-green-100 text-green-700' :
                article.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                'bg-slate-100 text-slate-500'
              }`}>
                {article.status === 'published' ? '已發布' : article.status === 'scheduled' ? '排程' : '草稿'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
