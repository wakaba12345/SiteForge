'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fff]+/g, '')
    .replace(/--+/g, '-');
}

interface ArticleData {
  id?: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'scheduled';
  category: string;
  tags: string[];
  cover_image: string;
  excerpt: string;
  content: string;
  published_at: string;
  seo_title: string;
  seo_description: string;
  sort_order: number;
}

const EMPTY: ArticleData = {
  title: '', slug: '', status: 'draft', category: '', tags: [],
  cover_image: '', excerpt: '', content: '',
  published_at: new Date().toISOString().slice(0, 10),
  seo_title: '', seo_description: '', sort_order: 0,
};

export default function ArticleForm({ initial }: { initial?: Partial<ArticleData> & { id?: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<ArticleData>({ ...EMPTY, ...initial });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!initial?.id;

  function set<K extends keyof ArticleData>(key: K, val: ArticleData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: f.slug && isEdit ? f.slug : slugify(title),
    }));
  }

  function addTag(raw: string) {
    const tag = raw.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      published_at: form.status === 'published' || form.status === 'scheduled'
        ? new Date(form.published_at).toISOString()
        : null,
    };

    const url = isEdit ? `/api/admin/articles/${initial!.id}` : '/api/admin/articles';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? '儲存失敗，請再試一次');
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          <div>
            <label className="mb-1 block text-sm font-medium">標題</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Slug（網址）</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              required
              className="w-full rounded border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">摘要</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              rows={2}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">內文</label>
            <textarea
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              rows={16}
              className="w-full rounded border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
              placeholder="支援 HTML 或純文字"
            />
          </div>

          {/* SEO */}
          <div className="rounded border bg-gray-50 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">SEO 設定</h3>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Meta 標題</label>
              <input
                type="text"
                value={form.seo_title}
                onChange={(e) => set('seo_title', e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Meta 描述</label>
              <textarea
                value={form.seo_description}
                onChange={(e) => set('seo_description', e.target.value)}
                rows={2}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status */}
          <div className="rounded border bg-white p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold">發布設定</h3>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">狀態</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as ArticleData['status'])}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
              >
                <option value="draft">草稿</option>
                <option value="published">已發布</option>
                <option value="scheduled">排程發布</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">發布日期</label>
              <input
                type="date"
                value={form.published_at}
                onChange={(e) => set('published_at', e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
              />
            </div>
            <div className="flex gap-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded bg-[#0d1f3c] py-2 text-sm text-white hover:bg-[#0d1f3c]/90 disabled:opacity-50"
              >
                {saving ? '儲存中…' : '儲存'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="flex-1 rounded border py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="rounded border bg-white p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold">封面圖片</h3>
            <input
              type="url"
              value={form.cover_image}
              onChange={(e) => set('cover_image', e.target.value)}
              placeholder="https://..."
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
            />
            {form.cover_image && (
              <img src={form.cover_image} alt="" className="w-full rounded object-cover aspect-video" />
            )}
          </div>

          {/* Category & Tags */}
          <div className="rounded border bg-white p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold">分類與標籤</h3>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">分類</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">標籤</label>
              <div className="mb-2 flex flex-wrap gap-1">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#0d1f3c] px-2 py-0.5 text-xs text-white">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-[#c9a84c]">×</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); }
                }}
                placeholder="輸入後按 Enter 新增"
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="rounded border bg-white p-4 shadow-sm">
            <label className="mb-1 block text-xs font-medium text-gray-600">排序（數字越小越前面）</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => set('sort_order', Number(e.target.value))}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
