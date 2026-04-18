'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewSitePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleNameChange(v: string) {
    setName(v);
    if (!slug) setSlug(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, ai_prompt: aiPrompt }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? '建立失敗');
      setLoading(false);
      return;
    }
    const site = await res.json();
    router.push(`/sites/${site.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <Link href="/sites" className="text-sm text-slate-500 hover:text-slate-700">← 返回</Link>
      </header>
      <main className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold text-slate-900 mb-6">新增站台</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">站台名稱</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="我的公司官網"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug（英文識別碼）</label>
            <input
              type="text"
              required
              pattern="[a-z0-9-]+"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-company"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">只能使用小寫英文、數字和連字號</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              AI 主題風格描述 <span className="text-slate-400 font-normal">（選填）</span>
            </label>
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="例：科技公司官網，深藍色系，現代簡約，專業感強"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">填寫後 AI 會自動產生主題配色與字型</p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? '建立中…' : '建立站台'}
          </button>
        </form>
      </main>
    </div>
  );
}
