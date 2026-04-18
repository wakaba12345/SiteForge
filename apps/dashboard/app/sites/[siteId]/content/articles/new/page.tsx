'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewArticlePage({ params }: { params: { siteId: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saving, setSaving] = useState(false);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slug)
      setSlug(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80));
  }

  async function save() {
    setSaving(true);
    const res = await fetch('/api/content/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_id: params.siteId,
        title,
        slug,
        content,
        excerpt,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        tags: [],
        sort_order: 0,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const article = await res.json();
      router.push(`/sites/${params.siteId}/content/articles/${article.id}`);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/sites/${params.siteId}/content/articles`} className="text-sm text-slate-500 hover:text-slate-700">← 文章列表</Link>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="draft">草稿</option>
            <option value="published">發布</option>
          </select>
          <button
            onClick={save}
            disabled={saving || !title || !slug}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '儲存中…' : '儲存'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="文章標題"
          className="text-2xl font-bold border-0 border-b border-slate-200 pb-3 focus:outline-none focus:border-blue-500 bg-transparent text-slate-900 placeholder-slate-300"
        />
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="url-slug"
          className="text-sm font-mono border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="摘要（選填）"
          className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="文章內容（支援 Markdown / MDX）"
          rows={20}
          className="text-sm font-mono border border-slate-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
