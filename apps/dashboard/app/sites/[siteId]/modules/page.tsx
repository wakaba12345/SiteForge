'use client';

import { useEffect, useState } from 'react';
import type { ModuleConfig, SocialConfig } from '@siteforge/types';

const MODULE_META: Record<keyof ModuleConfig, { label: string; desc: string }> = {
  marquee: { label: '跑馬燈', desc: '頁面頂部的滾動文字公告' },
  hero: { label: 'Hero', desc: '首頁大圖或影片橫幅' },
  news: { label: '最新消息', desc: '顯示最新消息列表' },
  articles: { label: '文章', desc: '文章列表與詳情頁' },
  contact: { label: '聯絡表單', desc: '讓訪客發送訊息' },
  footer: { label: '頁尾', desc: '顯示頁尾連結與版權' },
  social: { label: '社群連結', desc: '浮動的 LINE / Facebook / Email 按鈕' },
};

export default function ModulesPage({ params }: { params: { siteId: string } }) {
  const [config, setConfig] = useState<ModuleConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [socialDraft, setSocialDraft] = useState<Omit<SocialConfig, 'enabled'>>({
    line: '',
    facebook: '',
    email: '',
    position: 'right',
  });

  useEffect(() => {
    fetch(`/api/modules?siteId=${params.siteId}`)
      .then((r) => r.json())
      .then((data: ModuleConfig) => {
        setConfig(data);
        if (data.social) {
          setSocialDraft({
            line: data.social.line,
            facebook: data.social.facebook,
            email: data.social.email,
            position: data.social.position,
          });
        }
      });
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

  async function saveSocial() {
    if (!config) return;
    const next = { ...config, social: { ...config.social, ...socialDraft } };
    setConfig(next);
    setSaving(true);
    await fetch(`/api/modules?siteId=${params.siteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ social: socialDraft }),
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
          <div key={key} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
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

            {key === 'social' && config.social.enabled && (
              <div className="border-t border-slate-100 px-5 py-4 flex flex-col gap-3 bg-slate-50">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">LINE ID 或完整網址</label>
                  <input
                    type="text"
                    value={socialDraft.line}
                    onChange={(e) => setSocialDraft((d) => ({ ...d, line: e.target.value }))}
                    placeholder="@yourlineid 或 https://line.me/..."
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Facebook 頁面 ID 或完整網址</label>
                  <input
                    type="text"
                    value={socialDraft.facebook}
                    onChange={(e) => setSocialDraft((d) => ({ ...d, facebook: e.target.value }))}
                    placeholder="yourpage 或 https://facebook.com/..."
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={socialDraft.email}
                    onChange={(e) => setSocialDraft((d) => ({ ...d, email: e.target.value }))}
                    placeholder="hello@example.com"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">按鈕位置</label>
                  <div className="flex gap-3">
                    {(['left', 'right'] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setSocialDraft((d) => ({ ...d, position: pos }))}
                        className={`flex-1 text-sm py-2 rounded-lg border transition-colors ${
                          socialDraft.position === pos
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {pos === 'left' ? '靠左' : '靠右'}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={saveSocial}
                  className="mt-1 w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  儲存社群連結設定
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
