'use client';

import { useEffect, useState } from 'react';

const DEVICES = [
  { label: '桌機', value: 'desktop', width: '100%', icon: '🖥' },
  { label: '平板', value: 'tablet', width: '768px', icon: '📱' },
  { label: '手機', value: 'mobile', width: '390px', icon: '📲' },
] as const;

type DeviceKey = (typeof DEVICES)[number]['value'];

export default function PreviewPage({ params }: { params: { siteId: string } }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceKey>('desktop');

  useEffect(() => {
    fetch(`/api/sites/${params.siteId}`)
      .then((r) => r.json())
      .then((site) => {
        if (site?.domain) {
          setPreviewUrl(`https://${site.domain}`);
        } else if ((site?.seo_config as any)?.vercel_url) {
          setPreviewUrl((site.seo_config as any).vercel_url);
        }
      });
  }, [params.siteId]);

  const currentDevice = DEVICES.find((d) => d.value === device)!;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <h1 className="text-xl font-semibold text-slate-900">預覽</h1>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {DEVICES.map((d) => (
            <button
              key={d.value}
              onClick={() => setDevice(d.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                device === d.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{d.icon}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>

        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm text-blue-600 hover:text-blue-700"
          >
            在新分頁開啟 →
          </a>
        )}
      </div>

      {previewUrl ? (
        <div className="flex-1 flex justify-center overflow-auto bg-slate-100 rounded-xl border border-slate-200 p-4">
          <div
            className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300"
            style={{
              width: currentDevice.width,
              minHeight: 600,
              flexShrink: 0,
            }}
          >
            <iframe
              src={previewUrl}
              className="w-full h-full"
              style={{ minHeight: 600, border: 'none' }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
          請先在設定頁面配置網域或部署到 Vercel
        </div>
      )}
    </div>
  );
}
