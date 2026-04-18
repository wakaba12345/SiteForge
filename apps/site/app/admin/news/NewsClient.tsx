'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  category: string | null;
  is_pinned: boolean;
  status: 'published' | 'draft';
  published_at: string;
  url: string | null;
}

export default function NewsClient() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/news')
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); });
  }, []);

  async function togglePin(item: NewsItem) {
    const updated = { is_pinned: !item.is_pinned };
    await fetch(`/api/admin/news/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setItems((prev) => prev.map((n) => n.id === item.id ? { ...n, ...updated } : n));
  }

  async function deleteItem(id: string, title: string) {
    if (!confirm(`確定刪除「${title}」？`)) return;
    await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  const filtered = items.filter(
    (n) => n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-sm text-gray-400">載入中…</div>;

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋消息標題或分類…"
          className="w-full max-w-sm rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
        />
      </div>

      <div className="overflow-x-auto rounded border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 w-8">置頂</th>
              <th className="px-4 py-3">標題</th>
              <th className="px-4 py-3">分類</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">日期</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">尚無消息</td></tr>
            )}
            {filtered.map((n) => (
              <tr key={n.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => togglePin(n)}
                    className={`text-lg leading-none ${n.is_pinned ? 'text-[#c9a84c]' : 'text-gray-300 hover:text-[#c9a84c]'}`}
                    title={n.is_pinned ? '取消置頂' : '設為置頂'}
                  >
                    ★
                  </button>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                  {n.title}
                  {n.url && (
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs text-blue-400 hover:underline">連結↗</a>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{n.category ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    n.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {n.status === 'published' ? '已發布' : '草稿'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(n.published_at).toLocaleDateString('zh-TW')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/news/${n.id}`} className="text-[#0d1f3c] hover:text-[#c9a84c] font-medium">編輯</Link>
                    <button onClick={() => deleteItem(n.id, n.title)} className="text-red-400 hover:text-red-600">刪除</button>
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
