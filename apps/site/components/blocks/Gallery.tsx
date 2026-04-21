import type { GalleryBlockConfig } from '@siteforge/types';

export function GalleryBlock({ config }: { config: GalleryBlockConfig }) {
  if (!config.images?.length) return null;

  const cols = config.columns ?? (config.images.length <= 2 ? 2 : config.images.length <= 6 ? 3 : 4);
  const gridClass =
    cols === 2 ? 'sm:grid-cols-2' : cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <section className="py-20 md:py-24 px-6" style={{ background: 'var(--color-bg)' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
        {(config.eyebrow || config.heading || config.intro) && (
          <div className="text-center max-w-2xl mx-auto mb-12">
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
        )}

        <div className={`grid gap-4 ${gridClass}`}>
          {config.images.map((img, i) => (
            <figure
              key={i}
              className="group relative overflow-hidden"
              style={{ borderRadius: 'var(--border-radius)', background: 'var(--color-surface)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? ''}
                className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {img.caption && (
                <figcaption
                  className="absolute inset-x-0 bottom-0 px-4 py-3 text-sm font-medium"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                    color: '#fff',
                  }}
                >
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
