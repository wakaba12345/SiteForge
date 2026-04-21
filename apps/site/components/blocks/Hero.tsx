import Image from 'next/image';
import type { HeroBlockConfig } from '@siteforge/types';

export function HeroBlock({ config }: { config: HeroBlockConfig }) {
  const align = config.align ?? 'center';
  const hasImage = !!config.backgroundUrl;
  const textAlign = align === 'left' ? 'left' : 'center';
  const mx = align === 'left' ? '' : 'mx-auto';

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: hasImage ? undefined : 'var(--color-surface)',
        borderBottom: hasImage ? undefined : '1px solid var(--color-border)',
      }}
    >
      {hasImage && (
        <>
          <Image
            src={config.backgroundUrl!}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />
        </>
      )}

      <div
        className="relative z-10 mx-auto px-6 py-24 md:py-32"
        style={{ maxWidth: 'var(--max-width)' }}
      >
        <div className={`${mx} max-w-3xl`} style={{ textAlign }}>
          <div
            className={`mb-6 ${align === 'center' ? 'mx-auto' : ''}`}
            style={{ width: 48, height: 3, borderRadius: 99, background: hasImage ? 'var(--color-accent)' : 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
          />

          {config.eyebrow && (
            <p
              className="mb-4"
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: hasImage ? 'rgba(255,255,255,0.85)' : 'var(--color-accent)',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {config.eyebrow}
            </p>
          )}

          <h1
            className="leading-tight mb-6"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading)',
              color: hasImage ? '#fff' : 'var(--color-primary)',
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              letterSpacing: '-0.01em',
            }}
          >
            {config.title}
          </h1>

          {config.subtitle && (
            <p
              className="leading-relaxed mb-8"
              style={{
                color: hasImage ? 'rgba(255,255,255,0.88)' : 'var(--color-text-secondary)',
                fontSize: 'clamp(1rem, 1.4vw, 1.125rem)',
                maxWidth: '42rem',
                marginLeft: align === 'center' ? 'auto' : undefined,
                marginRight: align === 'center' ? 'auto' : undefined,
              }}
            >
              {config.subtitle}
            </p>
          )}

          {config.ctaText && config.ctaUrl && (
            <a
              href={config.ctaUrl}
              className="inline-block font-semibold transition-opacity hover:opacity-85"
              style={{
                background: hasImage ? 'var(--color-accent)' : 'var(--color-primary)',
                color: '#fff',
                padding: '0.85rem 2rem',
                borderRadius: 'var(--border-radius)',
                fontSize: '0.95rem',
              }}
            >
              {config.ctaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
