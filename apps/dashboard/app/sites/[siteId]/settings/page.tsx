'use client';

import { useEffect, useState } from 'react';
import type { Site } from '@siteforge/types';

export default function SettingsPage({ params }: { params: { siteId: string } }) {
  const [site, setSite] = useState<Site | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/sites/${params.siteId}`).then((r) => r.json()).then(setSite);
  }, [params.siteId]);

  async function save() {
    if (!site) return;
    setSaving(true);
    await fetch(`/api/sites/${params.siteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: site.name,
        domain: site.domain,
        status: site.status,
        seo_config: site.seo_config,
      }),
    });
    setSaving(false);
  }

  if (!site) return <div className="text-sm text-slate-400">載入中…</div>;

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">站台設定</h1>
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? '儲存中…' : '儲存'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 flex flex-col gap-4">
        <h2 className="font-medium text-slate-700 text-sm">基本資訊</h2>
        <div>
          <label className="block text-xs text-slate-500 mb-1">站台名稱</label>
          <input
            type="text"
            value={site.name}
            onChange={(e) => setSite({ ...site, name: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">自訂網域（選填）</label>
          <input
            type="text"
            value={site.domain ?? ''}
            onChange={(e) => setSite({ ...site, domain: e.target.value || null })}
            placeholder="www.example.com"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">狀態</label>
          <select
            value={site.status}
            onChange={(e) => setSite({ ...site, status: e.target.value as any })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="draft">草稿</option>
            <option value="active">上線</option>
            <option value="paused">暫停</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
        <h2 className="font-medium text-slate-700 text-sm">SEO</h2>
        {(['title', 'description'] as const).map((key) => (
          <div key={key}>
            <label className="block text-xs text-slate-500 mb-1 capitalize">{key}</label>
            <input
              type="text"
              value={site.seo_config[key]}
              onChange={(e) => setSite({ ...site, seo_config: { ...site.seo_config, [key]: e.target.value } })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs text-slate-500 mb-1">語言</label>
          <select
            value={site.seo_config.language}
            onChange={(e) => setSite({ ...site, seo_config: { ...site.seo_config, language: e.target.value } })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="zh-TW">繁體中文</option>
            <option value="zh-CN">簡體中文</option>
            <option value="ja">日文</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  );
}
