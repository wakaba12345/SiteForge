import type { TeamGridConfig } from '@siteforge/types';

export function TeamGridBlock({ config }: { config: TeamGridConfig }) {
  if (!config.members?.length) return null;

  const cols = config.columns ?? (config.members.length <= 2 ? 2 : config.members.length === 4 ? 4 : 3);
  const gridClass =
    cols === 2 ? 'sm:grid-cols-2' : cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3';

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

        <div className={`grid gap-8 ${gridClass}`}>
          {config.members.map((m, i) => (
            <div key={i} className="text-center">
              <div
                className="mx-auto mb-5 overflow-hidden"
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: '9999px',
                  background: m.photoUrl ? undefined : 'var(--color-surface)',
                  border: '3px solid var(--color-surface)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl font-black"
                    style={{
                      color: 'var(--color-primary)',
                      opacity: 0.25,
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {m.name.slice(0, 1)}
                  </div>
                )}
              </div>

              <h3
                className="font-bold text-lg leading-tight"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
              >
                {m.name}
              </h3>
              <p
                className="mt-1 text-sm font-medium"
                style={{ color: 'var(--color-accent)', letterSpacing: '0.02em' }}
              >
                {m.title}
              </p>
              {m.bio && (
                <p
                  className="mt-3 text-sm leading-relaxed px-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {m.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
