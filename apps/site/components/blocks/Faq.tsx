import type { FaqBlockConfig } from '@siteforge/types';

export function FaqBlock({ config }: { config: FaqBlockConfig }) {
  if (!config.items?.length) return null;

  return (
    <section className="py-20 md:py-24 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="mx-auto" style={{ maxWidth: '52rem' }}>
        <div className="text-center mb-12">
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

        <div className="flex flex-col gap-3">
          {config.items.map((item, i) => (
            <details
              key={i}
              className="group"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius)',
                overflow: 'hidden',
              }}
            >
              <summary
                className="cursor-pointer flex items-center justify-between px-6 py-5 font-semibold transition-colors list-none"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
              >
                <span className="flex-1 pr-4 leading-snug">{item.question}</span>
                <svg
                  className="shrink-0 transition-transform group-open:rotate-45"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: 'var(--color-accent)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 4v12M4 10h12" />
                </svg>
              </summary>
              <div
                className="px-6 pb-6 -mt-1 leading-relaxed prose"
                style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
