import type { TestimonialsBlockConfig } from '@siteforge/types';

export function TestimonialsBlock({ config }: { config: TestimonialsBlockConfig }) {
  if (!config.items?.length) return null;

  const cols = config.columns ?? (config.items.length === 1 ? 1 : config.items.length === 2 ? 2 : 3);
  const gridClass =
    cols === 1 ? '' : cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="py-20 md:py-24 px-6" style={{ background: 'var(--color-surface)' }}>
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

        <div className={`grid gap-6 ${gridClass}`}>
          {config.items.map((t, i) => (
            <figure
              key={i}
              className="relative flex flex-col p-8"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius)',
              }}
            >
              <span
                className="absolute top-5 right-6 text-6xl leading-none font-black select-none"
                style={{ color: 'var(--color-accent)', opacity: 0.15, fontFamily: 'var(--font-heading)' }}
              >
                &ldquo;
              </span>

              <blockquote
                className="text-base leading-relaxed mb-6 flex-1"
                style={{ color: 'var(--color-text)', fontStyle: 'normal' }}
              >
                {t.quote}
              </blockquote>

              <figcaption className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                {t.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.avatarUrl}
                    alt={t.author}
                    className="shrink-0 object-cover"
                    style={{ width: 44, height: 44, borderRadius: '9999px' }}
                  />
                ) : (
                  <div
                    className="shrink-0 flex items-center justify-center text-sm font-bold"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '9999px',
                      background: 'var(--color-surface)',
                      color: 'var(--color-primary)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {t.author.slice(0, 1)}
                  </div>
                )}
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                  >
                    {t.author}
                  </p>
                  {(t.role || t.company) && (
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {[t.role, t.company].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
