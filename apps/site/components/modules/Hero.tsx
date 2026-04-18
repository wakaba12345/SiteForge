import type { HeroConfig } from '@siteforge/types';

interface Props {
  config: HeroConfig;
}

export function Hero({ config }: Props) {
  const hasBackground = config.type !== 'gradient' && config.backgroundUrl;

  return (
    <section
      className="relative flex items-center justify-center min-h-[480px] px-6 py-20 text-center"
      style={
        hasBackground
          ? { backgroundImage: `url(${config.backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }
      }
    >
      {config.overlay && hasBackground && (
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
      )}
      <div className="relative z-10 max-w-2xl mx-auto">
        {config.title && (
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)', color: '#fff' }}
          >
            {config.title}
          </h1>
        )}
        {config.subtitle && (
          <p className="text-lg md:text-xl mb-8" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {config.subtitle}
          </p>
        )}
        {config.ctaText && config.ctaUrl && (
          <a
            href={config.ctaUrl}
            className="inline-block px-8 py-3 rounded-theme font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--border-radius)' }}
          >
            {config.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
