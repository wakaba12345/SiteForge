import type { CasesGridConfig } from '@siteforge/types';

export function CasesGridBlock({ config }: { config: CasesGridConfig }) {
  if (!config.items?.length) return null;

  const cols = config.columns ?? (config.items.length <= 2 ? 2 : 3);
  const gridClass = cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';

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
          {config.items.map((c, i) => {
            const Card: 'a' | 'div' = c.url ? 'a' : 'div';
            return (
              <Card
                key={i}
                {...(c.url ? { href: c.url } : {})}
                className="group flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius)',
                }}
              >
                {c.imageUrl && (
                  <div className="overflow-hidden" style={{ aspectRatio: '16/10' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.imageUrl}
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                )}

                <div className="flex-1 p-6 flex flex-col">
                  {c.client && (
                    <p
                      className="mb-2 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}
                    >
                      {c.client}
                    </p>
                  )}

                  <h3
                    className="font-bold text-lg mb-3 leading-snug"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
                  >
                    {c.title}
                  </h3>

                  <p
                    className="text-sm leading-relaxed mb-4 flex-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {c.description}
                  </p>

                  {c.results && (
                    <div
                      className="mt-auto pt-4 font-semibold text-sm"
                      style={{
                        borderTop: '1px dashed var(--color-border)',
                        color: 'var(--color-primary)',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      → {c.results}
                    </div>
                  )}

                  {c.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {c.tags.map((t, j) => (
                        <span
                          key={j}
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-secondary)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
