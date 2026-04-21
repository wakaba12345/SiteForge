import type { FeaturesGridConfig } from '@siteforge/types';

export function FeaturesGridBlock({ config }: { config: FeaturesGridConfig }) {
  if (!config.items?.length) return null;

  const cols = config.columns ?? (config.items.length <= 2 ? 2 : config.items.length === 4 ? 4 : 3);
  const gridClass =
    cols === 2
      ? 'sm:grid-cols-2'
      : cols === 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : 'sm:grid-cols-2 lg:grid-cols-3';

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
          {config.items.map((item, i) => (
            <div
              key={i}
              className="relative flex flex-col p-8 transition-shadow hover:shadow-md"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius)',
                borderTop: '3px solid var(--color-accent)',
              }}
            >
              <div className="mb-5">
                <span
                  className="block text-4xl font-black leading-none"
                  style={{
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-heading)',
                    opacity: 0.12,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {item.icon && (
                <div className="mb-4" style={{ fontSize: '1.75rem' }}>
                  {item.icon}
                </div>
              )}

              <h3
                className="font-bold text-lg mb-3 leading-snug"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
              >
                {item.title}
              </h3>

              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
