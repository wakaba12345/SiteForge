import type { StatsBlockConfig } from '@siteforge/types';

export function StatsBlock({ config }: { config: StatsBlockConfig }) {
  if (!config.items?.length) return null;

  const cols = Math.min(config.items.length, 4);
  const gridClass =
    cols === 2
      ? 'grid-cols-2'
      : cols === 3
      ? 'grid-cols-2 md:grid-cols-3'
      : 'grid-cols-2 md:grid-cols-4';

  return (
    <section className="py-20 md:py-24 px-6" style={{ background: 'var(--color-bg)' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
        {(config.eyebrow || config.heading) && (
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
                className="leading-tight"
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
          </div>
        )}

        <div
          className={`grid ${gridClass} gap-x-6 gap-y-10`}
          style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '3rem 0' }}
        >
          {config.items.map((s, i) => (
            <div key={i} className="text-center px-4">
              <div
                className="font-black leading-none mb-2"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                  color: 'var(--color-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {s.value}
                {s.suffix && (
                  <span
                    className="ml-1"
                    style={{
                      fontSize: '0.5em',
                      color: 'var(--color-accent)',
                      fontWeight: 700,
                    }}
                  >
                    {s.suffix}
                  </span>
                )}
              </div>
              <p
                className="text-sm font-medium"
                style={{
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.03em',
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
