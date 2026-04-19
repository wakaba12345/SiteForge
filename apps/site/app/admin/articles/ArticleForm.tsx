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

interface SpellError { wrong: string; correct: string; reason: string; }
interface Angle { title: string; description: string; hook: string; }
interface Opening { style: string; text: string; }

export default function ArticleForm({
  initial,
  aiEnabled = false,
}: {
  initial?: Partial<ArticleData> & { id?: string };
  aiEnabled?: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ArticleData>({ ...EMPTY, ...initial });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!initial?.id;

  // AI states
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [loadingSeo, setLoadingSeo] = useState(false);
  const [spellErrors, setSpellErrors] = useState<SpellError[]>([]);
  const [spellMessage, setSpellMessage] = useState('');
  const [loadingSpell, setLoadingSpell] = useState(false);
  const [showSpell, setShowSpell] = useState(false);

  const [angles, setAngles] = useState<Angle[]>([]);
  const [loadingAngles, setLoadingAngles] = useState(false);
  const [showAngles, setShowAngles] = useState(false);

  const [openings, setOpenings] = useState<Opening[]>([]);
  const [loadingOpenings, setLoadingOpenings] = useState(false);
  const [showOpenings, setShowOpenings] = useState(false);

  function set<K extends keyof ArticleData>(key: K, val: ArticleData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: f.slug && isEdit ? f.slug : slugify(title),
    }));
    setTitleSuggestions([]);
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

  async function suggestTitles() {
    setLoadingTitles(true);
    setTitleSuggestions([]);
    try {
      const res = await fetch('/api/admin/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
      const data = await res.json();
      setTitleSuggestions(data.titles ?? []);
    } finally {
      setLoadingTitles(false);
    }
  }

  async function generateSeo() {
    setLoadingSeo(true);
    try {
      const res = await fetch('/api/admin/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
      const data = await res.json();
      setForm((f) => ({
        ...f,
        seo_title: data.seoTitle || f.seo_title,
        seo_description: data.seoDescription || f.seo_description,
      }));
    } finally {
      setLoadingSeo(false);
    }
  }

  async function runSpellcheck() {
    setLoadingSpell(true);
    setShowSpell(false);
    try {
      const res = await fetch('/api/admin/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
      const data = await res.json();
      setSpellErrors(data.errors ?? []);
      setSpellMessage(data.message ?? '');
      setShowSpell(true);
    } finally {
      setLoadingSpell(false);
    }
  }

  function applySpellFix(e: SpellError) {
    setForm((f) => ({ ...f, content: f.content.replace(e.wrong, e.correct) }));
    setSpellErrors((prev) => prev.filter((x) => x !== e));
  }

  async function analyzeAngles() {
    setLoadingAngles(true);
    setShowAngles(false);
    try {
      const res = await fetch('/api/admin/analyze-angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
      const data = await res.json();
      setAngles(data.angles ?? []);
      setShowAngles(true);
    } finally {
      setLoadingAngles(false);
    }
  }

  async function generateOpenings() {
    setLoadingOpenings(true);
    setShowOpenings(false);
    try {
      const res = await fetch('/api/admin/opening-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
      const data = await res.json();
      setOpenings(data.suggestions ?? []);
      setShowOpenings(true);
    } finally {
      setLoadingOpenings(false);
    }
  }

  function applyOpening(text: string) {
    setForm((f) => ({ ...f, content: text + '\n\n' + f.content }));
    setShowOpenings(false);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
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

          {/* Title */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium">標題</label>
              {aiEnabled && (
                <button
                  type="button"
                  onClick={suggestTitles}
                  disabled={loadingTitles}
                  className="text-xs text-[#c9a84c] hover:text-[#b8943e] disabled:opacity-50 flex items-center gap-1"
                >
                  {loadingTitles ? '生成中…' : '✦ AI 建議標題'}
                </button>
              )}
            </div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
            />
            {titleSuggestions.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {titleSuggestions.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { handleTitleChange(t); setTitleSuggestions([]); }}
                    className="text-left text-sm px-3 py-1.5 rounded border border-[#c9a84c]/40 bg-[#c9a84c]/5 hover:bg-[#c9a84c]/10 text-[#0d1f3c]"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
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

          {/* Content */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium">內文</label>
              {aiEnabled && (
                <button
                  type="button"
                  onClick={runSpellcheck}
                  disabled={loadingSpell}
                  className="text-xs text-rose-500 hover:text-rose-600 disabled:opacity-50"
                >
                  {loadingSpell ? '校對中…' : '✦ AI 挑錯字'}
                </button>
              )}
            </div>
            <textarea
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              rows={16}
              className="w-full rounded border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
              placeholder="支援 HTML 或純文字"
            />
          </div>

          {/* Spellcheck results */}
          {showSpell && (
            <div className="rounded border border-rose-200 bg-rose-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-rose-800">{spellMessage}</p>
                <button type="button" onClick={() => setShowSpell(false)} className="text-xs text-rose-400 hover:text-rose-600">關閉</button>
              </div>
              {spellErrors.map((e, i) => (
                <div key={i} className="flex items-start justify-between gap-3 rounded bg-white border border-rose-100 px-3 py-2">
                  <div className="text-sm">
                    <span className="line-through text-red-500">{e.wrong}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="text-green-600 font-medium">{e.correct}</span>
                    <span className="ml-2 text-xs text-gray-400">{e.reason}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => applySpellFix(e)}
                    className="shrink-0 text-xs bg-rose-100 hover:bg-rose-200 text-rose-700 px-2 py-1 rounded"
                  >
                    套用
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Angles + Opening buttons row */}
          {aiEnabled && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={analyzeAngles}
                disabled={loadingAngles}
                className="flex-1 rounded-lg border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-100 disabled:opacity-50"
              >
                {loadingAngles ? '分析中…' : '✦ AI 切角分析'}
              </button>
              <button
                type="button"
                onClick={generateOpenings}
                disabled={loadingOpenings}
                className="flex-1 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-100 disabled:opacity-50"
              >
                {loadingOpenings ? '生成中…' : '✦ AI 第一段建議'}
              </button>
            </div>
          )}

          {/* Angles results */}
          {showAngles && angles.length > 0 && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-purple-800">切角分析（{angles.length} 個角度）</p>
                <button type="button" onClick={() => setShowAngles(false)} className="text-xs text-purple-400 hover:text-purple-600">關閉</button>
              </div>
              {angles.map((a, i) => (
                <div key={i} className="rounded bg-white border border-purple-100 p-3 space-y-1">
                  <p className="text-sm font-semibold text-purple-900">{a.title}</p>
                  <p className="text-xs text-gray-600">{a.description}</p>
                  <p className="text-xs text-purple-600 italic">「{a.hook}」</p>
                </div>
              ))}
            </div>
          )}

          {/* Opening suggestions */}
          {showOpenings && openings.length > 0 && (
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-teal-800">第一段建議（點「套用」加入文章開頭）</p>
                <button type="button" onClick={() => setShowOpenings(false)} className="text-xs text-teal-400 hover:text-teal-600">關閉</button>
              </div>
              {openings.map((o, i) => (
                <div key={i} className="rounded bg-white border border-teal-100 p-3 space-y-2">
                  <p className="text-xs font-semibold text-teal-700">{o.style}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{o.text}</p>
                  <button
                    type="button"
                    onClick={() => applyOpening(o.text)}
                    className="text-xs bg-teal-100 hover:bg-teal-200 text-teal-700 px-3 py-1 rounded"
                  >
                    套用到文章開頭
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* SEO */}
          <div className="rounded border bg-gray-50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">SEO 設定</h3>
              {aiEnabled && (
                <button
                  type="button"
                  onClick={generateSeo}
                  disabled={loadingSeo}
                  className="text-xs text-[#c9a84c] hover:text-[#b8943e] disabled:opacity-50"
                >
                  {loadingSeo ? '生成中…' : '✦ AI 自動生成'}
                </button>
              )}
            </div>
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
