'use client';

import { useEffect, useRef, useState } from 'react';
import type { Site } from '@siteforge/types';

interface DeployResult {
  url: string;
  adminPassword: string;
  projectId: string;
}

export default function SettingsPage({ params }: { params: { siteId: string } }) {
  const [site, setSite] = useState<Site | null>(null);
  const [saving, setSaving] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);

  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
  const [deployError, setDeployError] = useState('');

  useEffect(() => {
    fetch(`/api/sites/${params.siteId}`).then((r) => r.json()).then((s) => {
      setSite(s);
      setHeroImageUrl((s?.module_config as any)?.hero?.backgroundUrl ?? '');
      const seo = s?.seo_config as any;
      if (seo?.vercel_url) {
        setDeployResult({ url: seo.vercel_url, adminPassword: seo.admin_password ?? '', projectId: seo.vercel_project_id ?? '' });
      }
    });
  }, [params.siteId]);

  async function handleHeroFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('site_id', params.siteId);
      const res = await fetch('/api/media', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) setHeroImageUrl(data.url);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

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
        module_config: {
          ...(site.module_config as any),
          hero: {
            ...(site.module_config as any)?.hero,
            backgroundUrl: heroImageUrl || undefined,
          }
        },
      }),
    });
    setSaving(false);
  }

  async function deploy() {
    setDeploying(true);
    setDeployError('');
    try {
      const res = await fetch(`/api/sites/${params.siteId}/deploy`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '部署失敗');
      setDeployResult(data);
    } catch (e) {
      setDeployError(e instanceof Error ? e.message : '部署失敗，請再試一次');
    } finally {
      setDeploying(false);
    }
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

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 flex flex-col gap-4">
        <h2 className="font-medium text-slate-700 text-sm">SEO</h2>
        <div>
          <label className="block text-xs text-slate-500 mb-1">頁面標題</label>
          <input
            type="text"
            value={site.seo_config.title}
            onChange={(e) => setSite({ ...site, seo_config: { ...site.seo_config, title: e.target.value } })}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">網站描述</label>
          <textarea
            value={site.seo_config.description}
            onChange={(e) => setSite({ ...site, seo_config: { ...site.seo_config, description: e.target.value } })}
            rows={2}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Favicon 網址</label>
          <input
            type="url"
            value={site.seo_config.favicon ?? ''}
            onChange={(e) => setSite({ ...site, seo_config: { ...site.seo_config, favicon: e.target.value } })}
            placeholder="https://example.com/favicon.ico"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {site.seo_config.favicon && (
            <img src={site.seo_config.favicon} alt="favicon preview" className="mt-2 w-8 h-8 object-contain rounded" />
          )}
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">OG Image 網址（社群分享預覽圖）</label>
          <input
            type="url"
            value={site.seo_config.ogImage ?? ''}
            onChange={(e) => setSite({ ...site, seo_config: { ...site.seo_config, ogImage: e.target.value } })}
            placeholder="https://example.com/og.jpg"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4 flex flex-col gap-4">
        <div>
          <h2 className="font-medium text-slate-700 text-sm">Hero 主視覺</h2>
          <p className="text-xs text-slate-400 mt-0.5">設定 Hero 區塊的背景圖片，建議尺寸 1920×1080。</p>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">背景圖片</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://example.com/hero.jpg 或點選上傳"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => heroFileRef.current?.click()}
              disabled={uploading}
              className="shrink-0 bg-slate-100 text-slate-700 text-sm px-3 py-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 border border-slate-300 whitespace-nowrap"
            >
              {uploading ? '上傳中…' : '上傳圖片'}
            </button>
            <input
              ref={heroFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleHeroFileChange}
            />
          </div>
          {heroImageUrl && (
            <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 aspect-video relative">
              <img src={heroImageUrl} alt="Hero 預覽" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {/* Deploy section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
        <div>
          <h2 className="font-medium text-slate-700 text-sm">部署站台</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            首次部署會建立永久網址，之後<strong className="text-slate-600">套用內容不需重新部署</strong>。只有修改程式碼才需要再次部署。
          </p>
        </div>

        {deployResult && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm font-medium text-green-900">已部署成功</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">永久站台網址（內容更新不需重新部署）</p>
              <a
                href={deployResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {deployResult.url}
              </a>
            </div>
            {deployResult.adminPassword && (
              <div>
                <p className="text-xs text-slate-500 mb-1">後台管理密碼（請記錄）</p>
                <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono">
                  {deployResult.adminPassword}
                </code>
              </div>
            )}
            <p className="text-xs text-slate-400">
              後台管理網址：{deployResult.url}/admin
            </p>
          </div>
        )}

        {deployError && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {deployError}
          </div>
        )}

        <button
          onClick={deploy}
          disabled={deploying}
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {deploying ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              部署中，約需 30-60 秒…
            </span>
          ) : deployResult ? '重新部署' : '▲ 部署至 Vercel'}
        </button>

        <p className="text-xs text-slate-400">
          需在 Dashboard 環境變數設定 <code className="bg-slate-100 px-1 rounded">VERCEL_TOKEN</code>（可至 vercel.com/account/tokens 建立）。
        </p>
      </div>
    </div>
  );
}
