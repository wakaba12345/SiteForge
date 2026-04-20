import Image from 'next/image';
import type { HeroConfig } from '@siteforge/types';

interface Props { config: HeroConfig; }

const CtaButton = ({ href, text, outline }: { href: string; text: string; outline?: boolean }) => (
  <a
    href={href}
    className="inline-block px-8 py-3 font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5"
    style={outline
      ? { border: '2px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: 'var(--border-radius)', background: 'transparent' }
      : { background: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--border-radius)' }
    }
  >
    {text}
  </a>
);

function HeroCentered({ config }: Props) {
  const hasImage = !!config.backgroundUrl;

  if (hasImage) {
    return (
      <section className="relative flex items-center justify-center min-h-[520px] px-6 py-24 text-center overflow-hidden" style={{ minHeight: '520px', overflow: 'hidden', position: 'relative' }}>
        <Image
          src={config.backgroundUrl!}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.52)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          {config.title && (
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight"
              style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)', color: '#fff' }}>
              {config.title}
            </h1>
          )}
          {config.subtitle && (
            <p className="text-lg md:text-xl mb-8" style={{ color: 'rgba(255,255,255,0.88)' }}>{config.subtitle}</p>
          )}
          {config.ctaText && config.ctaUrl && (
            <a href={config.ctaUrl} className="inline-block px-8 py-3 font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--color-accent)', color: '#fff', borderRadius: 'var(--border-radius)' }}>
              {config.ctaText}
            </a>
          )}
        </div>
      </section>
    );
  }

  // No image: clean white/surface hero with gradient accent line
  return (
    <section
      className="flex items-center justify-center min-h-[480px] px-6 py-24 text-center"
      style={{ background: 'var(--color-bg)', minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Accent line */}
        <div className="w-12 h-1 rounded-full mx-auto mb-6"
          style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
        {config.title && (
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)', color: 'var(--color-text)' }}>
            {config.title}
          </h1>
        )}
        {config.subtitle && (
          <p className="text-lg md:text-xl mb-8 mx-auto" style={{ color: 'var(--color-text-secondary)', maxWidth: '36rem' }}>
            {config.subtitle}
          </p>
        )}
        {config.ctaText && config.ctaUrl && <CtaButton href={config.ctaUrl} text={config.ctaText} />}
      </div>
    </section>
  );
}

function HeroSplit({ config }: Props) {
  return (
    <section className="flex min-h-[500px]" style={{ background: 'var(--color-bg)', display: 'flex', minHeight: '500px' }}>
      {/* Left: text */}
      <div className="flex-1 flex items-center px-8 md:px-16 py-16" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '4rem 4rem' }}>
        <div className="max-w-lg">
          <div className="w-10 h-1 rounded-full mb-6"
            style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
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
        style={{ background: 'linear-gradient(145deg, var(--color-primary), var(--color-accent))', width: '42%', overflow: 'hidden', position: 'relative' }}
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-5" style={{ background: '#fff' }} />
        <div className="relative text-center px-8 z-10">
          <div className="text-8xl font-black opacity-15 leading-none select-none" style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>
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
      className="flex items-center justify-center min-h-[440px] px-6 py-24 text-center"
      style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', minHeight: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem', textAlign: 'center' }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="w-10 h-1 rounded-full mx-auto mb-6"
          style={{ background: 'var(--color-accent)' }} />
        {config.title && (
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)', color: 'var(--color-primary)' }}>
            {config.title}
          </h1>
        )}
        {config.subtitle && (
          <p className="text-lg md:text-xl mb-8 mx-auto" style={{ color: 'var(--color-text-secondary)', maxWidth: '36rem' }}>
            {config.subtitle}
          </p>
        )}
        {config.ctaText && config.ctaUrl && <CtaButton href={config.ctaUrl} text={config.ctaText} outline />}
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
