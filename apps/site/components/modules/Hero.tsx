import type { HeroConfig } from '@siteforge/types';

interface Props { config: HeroConfig; }

const CtaButton = ({ href, text }: { href: string; text: string }) => (
  <a
    href={href}
    className="inline-block px-8 py-3 font-semibold transition-opacity hover:opacity-90"
    style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--border-radius)' }}
  >
    {text}
  </a>
);

function HeroCentered({ config }: Props) {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)', color: '#fff' }}>
            {config.title}
          </h1>
        )}
        {config.subtitle && (
          <p className="text-lg md:text-xl mb-8" style={{ color: 'rgba(255,255,255,0.85)' }}>{config.subtitle}</p>
        )}
        {config.ctaText && config.ctaUrl && <CtaButton href={config.ctaUrl} text={config.ctaText} />}
      </div>
    </section>
  );
}

function HeroSplit({ config }: Props) {
  return (
    <section className="flex min-h-[480px]" style={{ background: 'var(--color-background)' }}>
      {/* Left: text */}
      <div className="flex-1 flex items-center px-8 md:px-16 py-16">
        <div className="max-w-lg">
          {config.title && (
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)', color: 'var(--color-text)' }}>
              {config.title}
            </h1>
          )}
          {config.subtitle && (
            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{config.subtitle}</p>
          )}
          {config.ctaText && config.ctaUrl && <CtaButton href={config.ctaUrl} text={config.ctaText} />}
        </div>
      </div>
      {/* Right: decorative block */}
      <div
        className="hidden md:flex w-[42%] items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, var(--color-primary), var(--color-accent))' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20" style={{ background: '#fff' }} />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="relative text-center px-8">
          <div className="text-7xl font-black opacity-20 leading-none select-none" style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
            {config.title?.slice(0, 2) ?? ''}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMinimal({ config }: Props) {
  return (
    <section
      className="flex items-center justify-center min-h-[420px] px-6 py-20 text-center"
      style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
    >
      <div className="max-w-2xl mx-auto">
        {config.title && (
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)', color: 'var(--color-primary)' }}>
            {config.title}
          </h1>
        )}
        {config.subtitle && (
          <p className="text-lg md:text-xl mb-8" style={{ color: 'var(--color-text-secondary)' }}>{config.subtitle}</p>
        )}
        {config.ctaText && config.ctaUrl && (
          <a
            href={config.ctaUrl}
            className="inline-block px-8 py-3 font-semibold border-2 transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--border-radius)',
            }}
          >
            {config.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

export function Hero({ config }: Props) {
  const layout = config.layout ?? 'centered';
  if (layout === 'split') return <HeroSplit config={config} />;
  if (layout === 'minimal') return <HeroMinimal config={config} />;
  return <HeroCentered config={config} />;
}
