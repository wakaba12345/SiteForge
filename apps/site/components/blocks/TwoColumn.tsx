import type { TwoColumnBlockConfig } from '@siteforge/types';

export function TwoColumnBlock({ config }: { config: TwoColumnBlockConfig }) {
  const imagePos = config.imagePosition ?? 'right';
  const imageFirst = imagePos === 'left';

  return (
    <section className="py-20 md:py-24 px-6" style={{ background: 'var(--color-bg)' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Image */}
          <div className={`${imageFirst ? 'md:order-1' : 'md:order-2'}`}>
            {config.imageUrl ? (
              <div
                className="overflow-hidden"
                style={{ borderRadius: 'var(--border-radius)', aspectRatio: '4/3' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="w-full"
                style={{
                  aspectRatio: '4/3',
                  background: 'linear-gradient(145deg, var(--color-primary), var(--color-accent))',
                  borderRadius: 'var(--border-radius)',
                  opacity: 0.9,
                }}
              />
            )}
          </div>

          {/* Text */}
          <div className={`${imageFirst ? 'md:order-2' : 'md:order-1'}`}>
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
                className="mb-5 leading-tight"
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

            <div
              className="prose"
              style={{ color: 'var(--color-text)' }}
              dangerouslySetInnerHTML={{ __html: config.body }}
            />

            {config.ctaText && config.ctaUrl && (
              <div className="mt-7">
                <a
                  href={config.ctaUrl}
                  className="inline-block font-semibold transition-opacity hover:opacity-85"
                  style={{
                    background: 'var(--color-primary)',
                    color: '#fff',
                    padding: '0.75rem 1.75rem',
                    borderRadius: 'var(--border-radius)',
                    fontSize: '0.95rem',
                  }}
                >
                  {config.ctaText}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
