import type { TextBlockConfig } from '@siteforge/types';

export function TextBlock({ config }: { config: TextBlockConfig }) {
  const align = config.align ?? 'left';
  const textAlign = align === 'center' ? 'center' : 'left';
  const narrow = config.narrow ?? true;
  const innerMax = narrow ? '42rem' : '56rem';

  return (
    <section
      className="py-20 md:py-24 px-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: innerMax, textAlign }}
      >
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
            className="mb-8 leading-tight"
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
      </div>
    </section>
  );
}
