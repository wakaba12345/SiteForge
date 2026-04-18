'use client';

import { useEffect, useState } from 'react';
import type { ModuleConfig } from '@siteforge/types';

const MODULE_META: Record<keyof ModuleConfig, { label: string; desc: string }> = {
  marquee: { label: '跑馬燈', desc: '頁面頂部的滾動文字公告' },
  hero: { label: 'Hero', desc: '首頁大圖或影片橫幅' },
  news: { label: '最新消息', desc: '顯示最新消息列表' },
  articles: { label: '文章', desc: '文章列表與詳情頁' },
  contact: { label: '聯絡表單', desc: '讓訪客發送訊息' },
  footer: { label: '頁尾', desc: '顯示頁尾連結與版權' },
};

export default function ModulesPage({ params }: { params: { siteId: string } }) {
  const [config, setConfig] = useState<ModuleConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/modules?siteId=${params.siteId}`)
      .then((r) => r.json())
      .then(setConfig);
  }, [params.siteId]);

  async function toggle(key: keyof ModuleConfig) {
    if (!config) return;
    const next = {
      ...config,
      [key]: { ...config[key], enabled: !config[key].enabled },
    };
    setConfig(next);
    setSaving(true);
    await fetch(`/api/modules?siteId=${params.siteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: { enabled: !config[key].enabled } }),
    });
    setSaving(false);
  }

  if (!config) return <div className="text-sm text-slate-400">載入中…</div>;

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">功能模組</h1>
        {saving && <span className="text-xs text-slate-400">儲存中…</span>}
      </div>
      <div className="flex flex-col gap-3">
        {(Object.keys(MODULE_META) as Array<keyof ModuleConfig>).map((key) => (
          <div
            key={key}
            className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-slate-900 text-sm">{MODULE_META[key].label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{MODULE_META[key].desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors focus:outline-none ${
                config[key].enabled ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  config[key].enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
