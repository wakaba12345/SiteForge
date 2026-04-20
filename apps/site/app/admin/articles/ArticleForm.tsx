'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import ImageUploader from '@/components/admin/ImageUploader';
import TagInput from '@/components/admin/TagInput';

const RichEditor = dynamicImport(() => import('@/components/admin/RichEditor'), { ssr: false });

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
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

interface SpellError { context: string; wrong: string; correct: string; reason: string; }
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
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!initial?.id;

  // AI states
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [loadingSeo, setLoadingSeo] = useState(false);
  const [seoOpen, setSeoOpen] = useState(Boolean(initial?.seo_title || initial?.seo_description));

  const [spellErrors, setSpellErrors] = useState<SpellError[] | null>(null);
  const [spellMessage, setSpellMessage] = useState('');
  const [loadingSpell, setLoadingSpell] = useState(false);

  const [angles, setAngles] = useState<Angle[]>([]);
  const [loadingAngles, setLoadingAngles] = useState(false);
  const [showAngles, setShowAngles] = useState(false);
  const [anglesError, setAnglesError] = useState('');

  const [openings, setOpenings] = useState<Opening[]>([]);
  const [loadingOpenings, setLoadingOpenings] = useState(false);
  const [showOpenings, setShowOpenings] = useState(false);
  const [openingError, setOpeningError] = useState('');

  function set<K extends keyof ArticleData>(key: K, val: ArticleData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
  }

  async function suggestTitles() {
    if (!form.title && !form.content) { setError('請先填寫標題或文章內容再生成'); return; }
    setLoadingTitles(true);
    setTitleSuggestions([]);
    setError('');
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
    if (!form.title && !form.content) { setError('請先填寫標題或文章內容再生成'); return; }
    setLoadingSeo(true);
    setError('');
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
      if (data.seoTitle || data.seoDescription) setSeoOpen(true);
    } finally {
      setLoadingSeo(false);
    }
  }

  async function runSpellcheck() {
    if (!form.title && !form.content) return;
    setLoadingSpell(true);
    setSpellErrors(null);
    setSpellMessage('');
    try {
      const res = await fetch('/api/admin/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
      const data = await res.json();
      setSpellErrors(data.errors ?? []);
      setSpellMessage(data.message ?? '');
    } finally {
      setLoadingSpell(false);
    }
  }

  function applySpellFix(err: SpellError, index: number) {
    let newContent = form.content;
    if (err.context && form.content.includes(err.context)) {
      const fixed = err.context.split(err.wrong).join(err.correct);
      newContent = form.content.replace(err.context, fixed);
    } else if (form.content.includes(err.wrong)) {
      newContent = form.content.replace(err.wrong, err.correct);
    }
    setForm((f) => ({ ...f, content: newContent }));
    setSpellErrors((prev) => (prev ? prev.filter((_, i) => i !== index) : null));
  }

  async function analyzeAngles() {
    if (!form.title && !form.content) { setAnglesError('請先填寫標題或文章內容'); return; }
    setLoadingAngles(true);
    setAngles([]);
    setAnglesError('');
    setShowAngles(true);
    try {
      const res = await fetch('/api/admin/analyze-angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setAnglesError(d.error || '分析失敗');
      } else {
        const data = await res.json();
        setAngles(data.angles ?? []);
      }
    } catch {
      setAnglesError('網路錯誤，請重試');
    } finally {
      setLoadingAngles(false);
    }
  }

  async function generateOpenings() {
    if (!form.title && !form.content) { setOpeningError('請先填寫標題或文章內容'); return; }
    setLoadingOpenings(true);
    setOpenings([]);
    setOpeningError('');
    setShowOpenings(true);
    try {
      const res = await fetch('/api/admin/opening-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setOpeningError(d.error || '生成失敗');
      } else {
        const data = await res.json();
        setOpenings(data.suggestions ?? []);
      }
    } catch {
      setOpeningError('網路錯誤，請重試');
    } finally {
      setLoadingOpenings(false);
    }
  }

  function applyOpening(text: string) {
    setForm((f) => ({ ...f, content: `<p>${text}</p>\n${f.content}` }));
    setOpenings([]);
    setShowOpenings(false);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.title || !form.slug) { setError('標題與 Slug 為必填'); return; }
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

    try {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : '網路錯誤，請重試');
    } finally {
      setSaving(false);
    }
  }

  const spin = (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium">標題</label>
          {aiEnabled && (
            <button
              type="button"
              onClick={suggestTitles}
              disabled={loadingTitles}
              className="inline-flex items-center gap-1 text-xs text-[#c9a84c] hover:underline disabled:opacity-50"
            >
              {loadingTitles && spin}
              {loadingTitles ? '生成中...' : 'AI 建議標題'}
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
          <div className="mt-2 rounded border border-[#c9a84c]/30 bg-[#c9a84c]/5 p-3">
            <p className="mb-2 text-xs font-medium text-gray-500">點擊套用：</p>
            <div className="space-y-1.5">
              {titleSuggestions.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { handleTitleChange(t); setTitleSuggestions([]); }}
                  className="block w-full rounded border border-transparent px-3 py-1.5 text-left text-sm text-[#0d1f3c] hover:border-[#c9a84c] hover:bg-white"
                >
                  {i + 1}. {t}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setTitleSuggestions([])}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600"
            >
              關閉建議
            </button>
          </div>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1 block text-sm font-medium">Slug（網址路徑）</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => { set('slug', e.target.value); setSlugTouched(true); }}
          required
          className="w-full rounded border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
        />
      </div>

      {/* Date + Status + Sort order */}
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <label className="mb-1 block text-sm font-medium">發布日期</label>
          <input
            type="date"
            value={form.published_at}
            onChange={(e) => set('published_at', e.target.value)}
            className="rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">狀態</label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value as ArticleData['status'])}
            className="rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
          >
            <option value="draft">草稿</option>
            <option value="published">已發布</option>
            <option value="scheduled">排程發布</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">排序</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => set('sort_order', Number(e.target.value))}
            className="w-24 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 block text-sm font-medium">分類</label>
        <input
          type="text"
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          placeholder="例：投資理財、美食、旅遊"
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="mb-2 block text-sm font-medium">關鍵字</label>
        <TagInput value={form.tags} onChange={(tags) => set('tags', tags)} />
      </div>

      {/* AI 自動生成 SEO */}
      {aiEnabled && (
        <div className="rounded-lg border border-dashed border-[#c9a84c]/50 bg-[#c9a84c]/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0d1f3c]">AI 自動生成</p>
              <p className="text-xs text-gray-500">根據標題與內容自動產生 Meta Title、Meta Description</p>
            </div>
            <button
              type="button"
              onClick={generateSeo}
              disabled={loadingSeo}
              className="inline-flex items-center gap-2 rounded bg-[#c9a84c] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8953f] disabled:opacity-50"
            >
              {loadingSeo && spin}
              {loadingSeo ? '生成中...' : 'AI 生成'}
            </button>
          </div>
        </div>
      )}

      {/* AI 切角分析 */}
      {aiEnabled && (
        <div className="rounded-lg border border-dashed border-purple-300 bg-purple-50/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0d1f3c]">AI 切角分析</p>
              <p className="text-xs text-gray-500 mt-0.5">分析素材主題，提供 6 個潛力報導角度、核心觀點與社群誘餌句</p>
            </div>
            <button
              type="button"
              onClick={analyzeAngles}
              disabled={loadingAngles}
              className="inline-flex items-center gap-2 shrink-0 rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loadingAngles && spin}
              {loadingAngles ? '分析中...' : '開始分析'}
            </button>
          </div>
          {anglesError && <p className="mt-2 text-xs text-red-500">{anglesError}</p>}
          {showAngles && angles.length > 0 && (
            <div className="mt-4 space-y-3">
              {angles.map((a, i) => (
                <div key={i} className="rounded-lg border border-purple-200 bg-white p-4">
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-[11px] font-bold text-purple-700">
                      {i + 1}
                    </span>
                    <p className="font-semibold text-sm text-[#0d1f3c]">{a.title}</p>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2 pl-7">{a.description}</p>
                  <div className="ml-7 rounded bg-purple-50 border border-purple-100 px-3 py-2">
                    <span className="text-[10px] font-semibold text-purple-500 uppercase tracking-wide">誘餌句</span>
                    <p className="text-xs text-purple-800 mt-0.5 leading-relaxed">{a.hook}</p>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => { setAngles([]); setShowAngles(false); }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                收起
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI 第一段建議 */}
      {aiEnabled && (
        <div className="rounded-lg border border-dashed border-teal-300 bg-teal-50/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0d1f3c]">AI 第一段建議</p>
              <p className="text-xs text-gray-500 mt-0.5">生成 5 種開場風格（數據震撼、場景代入、問題懸疑、故事敘事、觀點衝突），點擊即套用</p>
            </div>
            <button
              type="button"
              onClick={generateOpenings}
              disabled={loadingOpenings}
              className="inline-flex items-center gap-2 shrink-0 rounded bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {loadingOpenings && spin}
              {loadingOpenings ? '生成中...' : '生成開場'}
            </button>
          </div>
          {openingError && <p className="mt-2 text-xs text-red-500">{openingError}</p>}
          {showOpenings && openings.length > 0 && (
            <div className="mt-4 space-y-3">
              {openings.map((s, i) => (
                <div key={i} className="rounded-lg border border-teal-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
                      {s.style}
                    </span>
                    <button
                      type="button"
                      onClick={() => applyOpening(s.text)}
                      className="text-xs font-medium text-teal-600 hover:text-teal-800 hover:underline"
                    >
                      套用到文章開頭
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{s.text}</p>
                </div>
              ))}
              <button
                type="button"
                onClick={() => { setOpenings([]); setShowOpenings(false); }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                收起
              </button>
            </div>
          )}
        </div>
      )}

      {/* Excerpt */}
      <div>
        <label className="mb-1 block text-sm font-medium">摘要（列表與社群預覽會用到）</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => set('excerpt', e.target.value)}
          rows={2}
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
        />
      </div>

      {/* Cover image */}
      <div>
        <label className="mb-2 block text-sm font-medium">封面圖片</label>
        <ImageUploader value={form.cover_image} onChange={(url) => set('cover_image', url)} />
      </div>

      {/* SEO collapsible */}
      <div className="rounded border p-4">
        <button
          type="button"
          onClick={() => setSeoOpen(!seoOpen)}
          className="flex w-full items-center justify-between text-sm font-medium text-gray-600"
        >
          SEO 設定（選填）
          <span className={`transition-transform ${seoOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {seoOpen && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Meta Title</label>
              <input
                type="text"
                value={form.seo_title}
                onChange={(e) => set('seo_title', e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
              {form.seo_title && (
                <p className="mt-1 text-xs text-gray-400">{form.seo_title.length}/60 字</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Meta Description</label>
              <textarea
                value={form.seo_description}
                onChange={(e) => set('seo_description', e.target.value)}
                rows={2}
                className="w-full rounded border px-3 py-2 text-sm"
              />
              {form.seo_description && (
                <p className="mt-1 text-xs text-gray-400">{form.seo_description.length}/155 字</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content / Rich editor */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">文章內容</label>
          {aiEnabled && (
            <button
              type="button"
              onClick={runSpellcheck}
              disabled={loadingSpell}
              className="flex items-center gap-1.5 rounded border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50"
            >
              {loadingSpell ? (
                <>{spin} 檢查中...</>
              ) : (
                <>
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
                  </svg>
                  AI 挑錯字
                </>
              )}
            </button>
          )}
        </div>
        <RichEditor value={form.content} onChange={(html) => set('content', html)} />

        {/* Spellcheck results */}
        {spellErrors !== null && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/50">
            <div className="flex items-center justify-between border-b border-rose-200 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-rose-800">校對結果</span>
                {spellErrors.length > 0 ? (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                    {spellErrors.length} 處
                  </span>
                ) : (
                  <span className="rounded-full bg-green-500 px-2 py-0.5 text-[11px] font-bold text-white">
                    通過
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setSpellErrors(null); setSpellMessage(''); }}
                className="text-xs text-rose-400 hover:text-rose-600"
              >
                關閉
              </button>
            </div>

            {spellErrors.length === 0 ? (
              <p className="px-4 py-3 text-sm text-green-700">
                {spellMessage || '未發現明顯錯誤，文章品質良好！'}
              </p>
            ) : (
              <div className="divide-y divide-rose-100">
                {spellErrors.map((err, i) => (
                  <div key={i} className="px-4 py-3">
                    {err.context && (
                      <p className="mb-2 text-xs text-gray-500 leading-relaxed">
                        {err.context.split(err.wrong).map((part, pi, arr) => (
                          <span key={pi}>
                            {part}
                            {pi < arr.length - 1 && (
                              <mark className="rounded bg-rose-200 px-0.5 text-rose-900 not-italic">
                                {err.wrong}
                              </mark>
                            )}
                          </span>
                        ))}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-rose-100 px-2 py-0.5 font-medium text-rose-700 line-through">
                          {err.wrong}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="rounded bg-green-100 px-2 py-0.5 font-medium text-green-700">
                          {err.correct}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => applySpellFix(err, i)}
                        className="shrink-0 rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 active:bg-green-800"
                      >
                        套用修改
                      </button>
                    </div>
                    {err.reason && (
                      <p className="mt-1 text-xs text-gray-400">{err.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded bg-[#0d1f3c] px-6 py-2 text-white transition-colors hover:bg-[#0d1f3c]/90 disabled:opacity-50"
        >
          {saving && spin}
          {saving ? '儲存中...' : isEdit ? '更新文章' : '發布文章'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="rounded border px-6 py-2 text-gray-600 hover:bg-gray-50"
        >
          取消
        </button>
        {isEdit && form.slug && (
          <a
            href={`/articles/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-emerald-600 hover:underline"
          >
            預覽 →
          </a>
        )}
      </div>
    </form>
  );
}
