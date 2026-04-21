'use client';

import { useState } from 'react';
import type { ContactFormBlockConfig } from '@siteforge/types';

const FIELD_LABELS: Record<string, string> = {
  name: '姓名',
  email: '電子郵件',
  phone: '電話',
  company: '公司 / 單位',
  message: '訊息',
};

export function ContactFormBlock({ config, siteId }: { config: ContactFormBlockConfig; siteId: string }) {
  const fields = config.fields?.length ? config.fields : ['name', 'email', 'message'];
  const submitText = config.submitText ?? '送出';
  const successMessage = config.successMessage ?? '已收到您的訊息，我們會盡快回覆。';

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

  return (
    <section className="py-20 md:py-24 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="mx-auto" style={{ maxWidth: '42rem' }}>
        <div className="text-center mb-10">
          {config.eyebrow && (
            <p
              className="mb-3"
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {config.eyebrow}
            </p>
          )}
          {config.heading && (
            <h2
              className="mb-4 leading-tight"
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 'var(--font-weight-heading)',
                color: 'var(--color-text)',
                fontSize: 'clamp(1.75rem, 3.5vw, 2.375rem)',
                letterSpacing: '-0.01em',
              }}
            >
              {config.heading}
            </h2>
          )}
          {config.intro && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7 }}>
              {config.intro}
            </p>
          )}
        </div>

        {status === 'done' ? (
          <div
            className="p-8 text-center"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius)',
            }}
          >
            <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>
              {successMessage}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 p-8"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius)',
            }}
          >
            {fields.map((field) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label
                  className="text-sm font-semibold"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                >
                  {FIELD_LABELS[field] ?? field}
                </label>
                {field === 'message' ? (
                  <textarea
                    rows={5}
                    required
                    className="rounded border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-0"
                    style={{
                      borderColor: 'var(--color-border)',
                      borderRadius: 'var(--border-radius)',
                      color: 'var(--color-text)',
                      background: 'var(--color-bg)',
                    }}
                    value={values[field] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
                  />
                ) : (
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    required
                    className="rounded border px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--color-border)',
                      borderRadius: 'var(--border-radius)',
                      color: 'var(--color-text)',
                      background: 'var(--color-bg)',
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
              className="mt-2 py-3 px-6 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                background: 'var(--color-primary)',
                borderRadius: 'var(--border-radius)',
                fontSize: '0.95rem',
              }}
            >
              {status === 'sending' ? '傳送中…' : submitText}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
