'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NewsData {
  id?: string;
  title: string;
  content: string;
  url: string;
  category: string;
  is_pinned: boolean;
  status: 'published' | 'draft';
  published_at: string;
  sort_order: number;
}

const EMPTY: NewsData = {
  title: '', content: '', url: '', category: '',
  is_pinned: false, status: 'published',
  published_at: new Date().toISOString().slice(0, 10),
  sort_order: 0,
};

export default function NewsForm({ initial }: { initial?: Partial<NewsData> & { id?: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<NewsData>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!initial?.id;

  function set<K extends keyof NewsData>(key: K, val: NewsData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = { ...form, published_at: new Date(form.published_at).toISOString() };
    const url = isEdit ? `/api/admin/news/${initial!.id}` : '/api/admin/news';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push('/admin/news');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? '儲存失敗');
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {error && (
        <div className="lg:col-span-3 rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="lg:col-span-2 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">標題</label>
          <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">內文</label>
          <textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={8}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">外部連結（選填）</label>
          <input type="url" value={form.url} onChange={(e) => set('url', e.target.value)}
            placeholder="https://..."
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50" />
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded border bg-white p-4 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold">設定</h3>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">狀態</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value as NewsData['status'])}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50">
              <option value="published">已發布</option>
              <option value="draft">草稿</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">分類</label>
            <input type="text" value={form.category} onChange={(e) => set('category', e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">日期</label>
            <input type="date" value={form.published_at} onChange={(e) => set('published_at', e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">排序</label>
            <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="pinned" checked={form.is_pinned} onChange={(e) => set('is_pinned', e.target.checked)}
              className="rounded border-gray-300" />
            <label htmlFor="pinned" className="text-sm">置頂</label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 rounded bg-[#0d1f3c] py-2 text-sm text-white hover:bg-[#0d1f3c]/90 disabled:opacity-50">
              {saving ? '儲存中…' : '儲存'}
            </button>
            <button type="button" onClick={() => router.push('/admin/news')}
              className="flex-1 rounded border py-2 text-sm text-gray-600 hover:bg-gray-50">
              取消
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
