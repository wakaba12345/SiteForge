'use client';

import { useEffect, useState } from 'react';
import type { ThemeConfig } from '@siteforge/types';

const FONTS = [
  'Inter', 'Noto Sans TC', 'Noto Sans JP', 'Plus Jakarta Sans', 'DM Sans',
  'Outfit', 'Manrope', 'Space Grotesk', 'Noto Serif TC', 'Noto Serif JP',
  'Playfair Display', 'Lora',
];

const COLOR_KEYS: Array<{ key: keyof ThemeConfig['colors']; label: string }> = [
  { key: 'primary', label: '主色' },
  { key: 'accent', label: '強調色' },
  { key: 'background', label: '背景色' },
  { key: 'surface', label: '卡片背景' },
  { key: 'text', label: '文字色' },
  { key: 'textSecondary', label: '次要文字' },
  { key: 'border', label: '邊框色' },
];

export default function ThemePage({ params }: { params: { siteId: string } }) {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [prompt, setPrompt] = useState('');
  const [variants, setVariants] = useState<ThemeConfig[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/theme?siteId=${params.siteId}`)
      .then((r) => r.json())
      .then((t) => { setTheme(t); setPrompt(t.ai_prompt ?? ''); });
  }, [params.siteId]);

  async function generate() {
    if (!prompt) return;
    setGenerating(true);
    const res = await fetch('/api/theme/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, siteId: params.siteId }),
    });
    const { variants: v } = await res.json();
    setVariants(v);
    setGenerating(false);
  }

  async function applyVariant(v: ThemeConfig) {
    const next = { ...v, ai_prompt: prompt };
    setTheme(next);
    setVariants([]);
    await saveTheme(next);
  }

  async function saveTheme(t: ThemeConfig) {
    setSaving(true);
    await fetch(`/api/theme?siteId=${params.siteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t),
    });
    setSaving(false);
  }

  function updateColor(key: keyof ThemeConfig['colors'], value: string) {
    if (!theme) return;
    const next = { ...theme, colors: { ...theme.colors, [key]: value } };
    setTheme(next);
  }

  if (!theme) return <div className="text-sm text-slate-400">載入中…</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">主題風格</h1>
        <div className="flex gap-2">
          {saving && <span className="text-xs text-slate-400 self-center">儲存中…</span>}
          <button
            onClick={() => saveTheme(theme)}
            disabled={saving}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            儲存
          </button>
        </div>
      </div>

      {/* AI Generator */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <h2 className="font-medium text-slate-700 mb-3 text-sm">AI 主題生成</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你要的風格，例如：簡約醫療診所，藍白色系，專業沉穩"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={generate}
            disabled={generating || !prompt}
            className="shrink-0 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {generating ? '生成中…' : '生成'}
          </button>
        </div>

        {variants.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {variants.map((v, i) => (
              <button
                key={i}
                onClick={() => applyVariant(v)}
                className="border border-slate-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors text-left"
              >
                <div
                  className="h-16 w-full"
                  style={{ background: `linear-gradient(135deg, ${v.colors.primary}, ${v.colors.accent})` }}
                />
                <div className="p-2">
                  <div className="flex gap-1 mb-1">
                    {[v.colors.primary, v.colors.accent, v.colors.surface].map((c) => (
                      <span key={c} className="w-4 h-4 rounded-full border border-slate-200" style={{ background: c }} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{v.typography.headingFont}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color Pickers */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h2 className="font-medium text-slate-700 mb-3 text-sm">配色</h2>
        <div className="grid grid-cols-2 gap-3">
          {COLOR_KEYS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <input
                type="color"
                value={theme.colors[key]}
                onChange={(e) => updateColor(key, e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-slate-200"
              />
              <div>
                <p className="text-xs font-medium text-slate-700">{label}</p>
                <p className="text-xs text-slate-400 font-mono">{theme.colors[key]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h2 className="font-medium text-slate-700 mb-3 text-sm">字型</h2>
        <div className="grid grid-cols-2 gap-3">
          {['headingFont', 'bodyFont'].map((key) => (
            <div key={key}>
              <label className="block text-xs text-slate-500 mb-1">
                {key === 'headingFont' ? '標題字型' : '內文字型'}
              </label>
              <select
                value={theme.typography[key as keyof typeof theme.typography]}
                onChange={(e) =>
                  setTheme({ ...theme, typography: { ...theme.typography, [key]: e.target.value } })
                }
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
              >
                {FONTS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Layout */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-medium text-slate-700 mb-3 text-sm">版型</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="block text-xs text-slate-500 mb-1">圓角大小</label>
            <input
              type="text"
              value={theme.layout.borderRadius}
              onChange={(e) => setTheme({ ...theme, layout: { ...theme.layout, borderRadius: e.target.value } })}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">最大寬度</label>
            <input
              type="text"
              value={theme.layout.maxWidth}
              onChange={(e) => setTheme({ ...theme, layout: { ...theme.layout, maxWidth: e.target.value } })}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Header 樣式</label>
            <select
              value={theme.layout.headerStyle}
              onChange={(e) =>
                setTheme({ ...theme, layout: { ...theme.layout, headerStyle: e.target.value as any } })
              }
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
            >
              <option value="fixed">Fixed（固定）</option>
              <option value="static">Static（靜態）</option>
              <option value="transparent">Transparent（透明）</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
