'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'scheduled';
  category: string | null;
  published_at: string | null;
  cover_image: string | null;
  created_at: string;
}

export default function ArticlesClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/articles')
      .then((r) => r.json())
      .then((data) => { setArticles(data); setLoading(false); });
  }, []);

  async function deleteArticle(id: string, title: string) {
    if (!confirm(`確定刪除「${title}」？此操作無法復原。`)) return;
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  const filtered = articles.filter(
    (a) => a.title.toLowerCase().includes(search.toLowerCase()) || a.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-sm text-gray-400">載入中…</div>;

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋文章標題或 slug…"
          className="w-full max-w-sm rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
        />
      </div>

      <div className="overflow-x-auto rounded border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">標題</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">分類</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">發布日期</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">尚無文章</td>
              </tr>
            )}
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                  {a.cover_image && (
                    <img src={a.cover_image} alt="" className="inline-block w-8 h-8 rounded object-cover mr-2 align-middle" />
                  )}
                  {a.title}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.slug}</td>
                <td className="px-4 py-3 text-gray-600">{a.category ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    a.status === 'published' ? 'bg-green-100 text-green-700' :
                    a.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {a.status === 'published' ? '已發布' : a.status === 'scheduled' ? '排程中' : '草稿'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {a.published_at ? new Date(a.published_at).toLocaleDateString('zh-TW') : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/articles/${a.id}`}
                      className="text-[#0d1f3c] hover:text-[#c9a84c] font-medium"
                    >
                      編輯
                    </Link>
                    <a
                      href={`/articles/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      預覽
                    </a>
                    <button
                      onClick={() => deleteArticle(a.id, a.title)}
                      className="text-red-400 hover:text-red-600"
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
