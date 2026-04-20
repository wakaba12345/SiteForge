'use client';

import { useState, useRef } from 'react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const { url } = await res.json();
        onChange(url);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <div className="mb-2 flex gap-4 text-sm">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={mode === 'upload' ? 'text-[#c9a84c] font-medium' : 'text-gray-500'}
        >
          上傳圖片
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={mode === 'url' ? 'text-[#c9a84c] font-medium' : 'text-gray-500'}
        >
          輸入網址
        </button>
      </div>

      {mode === 'upload' ? (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="text-sm"
          />
          {uploading && <p className="mt-1 text-xs text-gray-500">上傳中...</p>}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50"
        />
      )}

      {value && (
        <div className="mt-3">
          <img
            src={value}
            alt="Cover preview"
            className="h-32 rounded border object-cover"
          />
        </div>
      )}
    </div>
  );
}
