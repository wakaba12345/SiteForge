'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Article } from '@siteforge/types';

export default function EditArticlePage({ params }: { params: { siteId: string; articleId: string } }) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/content/articles/${params.articleId}`)
      .then((r) => r.json())
      .then(setArticle);
  }, [params.articleId]);

  async function save() {
    if (!article) return;
    setSaving(true);
    await fetch(`/api/content/articles/${params.articleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        status: article.status,
        published_at: article.status === 'published' && !article.published_at
          ? new Date().toISOString()
          : article.published_at,
      }),
    });
    setSaving(false);
  }

  async function deleteArticle() {
    if (!confirm('確定要刪除這篇文章嗎？')) return;
    setDeleting(true);
    await fetch(`/api/content/articles/${params.articleId}`, { method: 'DELETE' });
    router.push(`/sites/${params.siteId}/content/articles`);
  }

  if (!article) return <div className="text-sm text-slate-400">載入中…</div>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/sites/${params.siteId}/content/articles`} className="text-sm text-slate-500 hover:text-slate-700">← 文章列表</Link>
        <div className="flex gap-2">
          <button onClick={deleteArticle} disabled={deleting} className="text-sm text-red-500 hover:text-red-700 px-3 py-2 disabled:opacity-50">
            刪除
          </button>
          <select
            value={article.status}
            onChange={(e) => setArticle({ ...article, status: e.target.value as any })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="draft">草稿</option>
            <option value="published">發布</option>
          </select>
          <button
            onClick={save}
            disabled={saving}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '儲存中…' : '儲存'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={article.title}
          onChange={(e) => setArticle({ ...article, title: e.target.value })}
          className="text-2xl font-bold border-0 border-b border-slate-200 pb-3 focus:outline-none focus:border-blue-500 bg-transparent text-slate-900"
        />
        <input
          type="text"
          value={article.slug}
          onChange={(e) => setArticle({ ...article, slug: e.target.value })}
          className="text-sm font-mono border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={article.excerpt ?? ''}
          onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
          placeholder="摘要（選填）"
          className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={article.content}
          onChange={(e) => setArticle({ ...article, content: e.target.value })}
          rows={20}
          className="text-sm font-mono border border-slate-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
