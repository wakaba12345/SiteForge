'use client';

import { useEffect, useState } from 'react';
import type { MarqueeItem } from '@siteforge/types';

export default function MarqueePage({ params }: { params: { siteId: string } }) {
  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [adding, setAdding] = useState(false);

  async function load() {
    const data = await fetch(`/api/content/marquee?siteId=${params.siteId}`).then((r) => r.json());
    setItems(data);
  }

  useEffect(() => { load(); }, [params.siteId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    await fetch('/api/content/marquee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: params.siteId, text, url: url || null, is_active: true, sort_order: items.length }),
    });
    setText(''); setUrl('');
    setAdding(false);
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/content/marquee/${id}`, { method: 'DELETE' });
    load();
  }

  async function toggle(item: MarqueeItem) {
    await fetch(`/api/content/marquee/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    load();
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">跑馬燈</h1>

      <form onSubmit={add} className="bg-white rounded-xl border border-slate-200 p-5 mb-6 flex flex-col gap-3">
        <h2 className="font-medium text-slate-700 text-sm">新增項目</h2>
        <input
          type="text"
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="顯示文字"
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
        {items.length === 0 && <p className="text-sm text-slate-400 p-5">尚無項目</p>}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${item.is_active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                {item.text}
              </p>
              {item.url && <p className="text-xs text-slate-400 truncate">{item.url}</p>}
            </div>
            <button
              onClick={() => toggle(item)}
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.is_active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}
            >
              {item.is_active ? '啟用' : '停用'}
            </button>
            <button onClick={() => remove(item.id)} className="text-xs text-red-400 hover:text-red-600">刪除</button>
          </div>
        ))}
      </div>
    </div>
  );
}
