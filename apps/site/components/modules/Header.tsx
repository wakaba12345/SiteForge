'use client';

import { useState } from 'react';

interface Props {
  siteName: string;
  links: Array<{ label: string; href: string }>;
}

export function Header({ siteName, links }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="mx-auto flex items-center justify-between px-6 py-4" style={{ maxWidth: 'var(--max-width)' }}>
        <a
          href="/"
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}
        >
          {siteName}
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" style={{ alignItems: 'center', gap: '1.5rem' }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 500 }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded"
          style={{ color: 'var(--color-text)' }}
          onClick={() => setOpen(!open)}
          aria-label="選單"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t px-6 py-3 flex flex-col gap-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium py-1"
              style={{ color: 'var(--color-text)' }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
