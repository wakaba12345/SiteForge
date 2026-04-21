import type { CtaBlockConfig } from '@siteforge/types';

export function CtaBlock({ config }: { config: CtaBlockConfig }) {
  return (
    <section
      className="py-24 px-6 relative overflow-hidden"
      style={{ background: 'var(--color-primary)' }}
    >
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10"
        style={{ background: 'var(--color-accent)' }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10"
        style={{ background: '#fff' }}
      />

      <div
        className="relative z-10 mx-auto text-center max-w-3xl"
      >
        <h2
          className="mb-5 leading-tight"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            color: '#fff',
            fontSize: 'clamp(1.75rem, 3.8vw, 2.5rem)',
            letterSpacing: '-0.01em',
          }}
        >
          {config.title}
        </h2>

        {config.description && (
          <p
            className="mb-9 leading-relaxed mx-auto"
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '1.0625rem',
              maxWidth: '38rem',
            }}
          >
            {config.description}
          </p>
        )}

        <a
          href={config.buttonUrl}
          className="inline-block font-semibold transition-opacity hover:opacity-90"
          style={{
            background: 'var(--color-accent)',
            color: '#fff',
            padding: '0.95rem 2.25rem',
            borderRadius: 'var(--border-radius)',
            fontSize: '1rem',
            letterSpacing: '0.02em',
          }}
        >
          {config.buttonText}
        </a>
      </div>
    </section>
  );
}
