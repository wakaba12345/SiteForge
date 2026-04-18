'use client';

import { useState } from 'react';
import type { ContactConfig } from '@siteforge/types';

const FIELD_LABELS: Record<string, string> = {
  name: '姓名',
  email: '電子郵件',
  phone: '電話',
  message: '訊息',
};

interface Props {
  siteId: string;
  config: ContactConfig;
}

export function ContactForm({ siteId, config }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId, data: values }),
      });
      if (!res.ok) throw new Error();
      setStatus('done');
      setValues({});
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <section className="py-12 px-6" style={{ background: 'var(--color-surface)' }}>
        <div className="mx-auto max-w-lg text-center">
          <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>
            {config.successMessage}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="mx-auto max-w-lg">
        <h2
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
        >
          聯絡我們
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {config.fields.map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {FIELD_LABELS[field] ?? field}
              </label>
              {field === 'message' ? (
                <textarea
                  rows={5}
                  required
                  className="rounded border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--border-radius)',
                    color: 'var(--color-text)',
                    background: '#fff',
                  }}
                  value={values[field] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
                />
              ) : (
                <input
                  type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                  required
                  className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--border-radius)',
                    color: 'var(--color-text)',
                    background: '#fff',
                  }}
                  value={values[field] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
                />
              )}
            </div>
          ))}
          {status === 'error' && (
            <p className="text-sm" style={{ color: 'var(--color-accent)' }}>
              傳送失敗，請稍後再試。
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'sending'}
            className="py-2.5 px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'var(--color-accent)',
              borderRadius: 'var(--border-radius)',
            }}
          >
            {status === 'sending' ? '傳送中…' : '送出'}
          </button>
        </form>
      </div>
    </section>
  );
}
