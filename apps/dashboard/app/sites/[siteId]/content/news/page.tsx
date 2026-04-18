'use client';

import { useEffect, useState } from 'react';
import type { NewsItem } from '@siteforge/types';

export default function NewsPage({ params }: { params: { siteId: string } }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [adding, setAdding] = useState(false);

  async function load() {
    const data = await fetch(`/api/content/news?siteId=${params.siteId}`).then((r) => r.json());
    setItems(data);
  }

  useEffect(() => { load(); }, [params.siteId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    await fetch('/api/content/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: params.siteId, title, content, url: url || null, status: 'published', is_pinned: false, sort_order: 0, published_at: new Date().toISOString() }),
    });
    setTitle(''); setContent(''); setUrl('');
    setAdding(false);
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/content/news/${id}`, { method: 'DELETE' });
    load();
  }

  async function togglePin(item: NewsItem) {
    await fetch(`/api/content/news/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: !item.is_pinned }),
    });
    load();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">最新消息</h1>

      <form onSubmit={add} className="bg-white rounded-xl border border-slate-200 p-5 mb-6 flex flex-col gap-3">
        <h2 className="font-medium text-slate-700 text-sm">新增消息</h2>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="標題"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="內容（選填）"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="連結 URL（選填）"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={adding}
          className="self-end bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          新增
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {items.length === 0 && (
          <p className="text-sm text-slate-400 p-5">尚無消息</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
              <p className="text-xs text-slate-400">{new Date(item.published_at).toLocaleDateString('zh-TW')}</p>
            </div>
            <button
              onClick={() => togglePin(item)}
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.is_pinned ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}
            >
              {item.is_pinned ? '已置頂' : '置頂'}
            </button>
            <button onClick={() => remove(item.id)} className="text-xs text-red-400 hover:text-red-600">刪除</button>
          </div>
        ))}
      </div>
    </div>
  );
}
