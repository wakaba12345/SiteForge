import type { ProcessStepsBlockConfig } from '@siteforge/types';

export function ProcessStepsBlock({ config }: { config: ProcessStepsBlockConfig }) {
  if (!config.items?.length) return null;

  const cols = Math.min(config.items.length, 4);

  return (
    <section className="py-20 md:py-24 px-6" style={{ background: 'var(--color-bg)' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
        <div className="text-center max-w-2xl mx-auto mb-14">
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

        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {config.items.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center relative px-2">
              {i < config.items.length - 1 && (
                <div
                  className="hidden md:block absolute"
                  style={{ right: '-1rem', top: '1.6rem', color: 'var(--color-border)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}

              <div
                className="w-14 h-14 flex items-center justify-center mb-5 text-lg font-black shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  color: '#fff',
                  fontFamily: 'var(--font-heading)',
                  borderRadius: '9999px',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>

              <h3
                className="font-bold text-base mb-2 leading-snug"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
