import type { CtaConfig } from '@siteforge/types';

export function CtaSection({ config }: { config: CtaConfig }) {
  return (
    <section
      className="py-24 px-6 relative overflow-hidden"
      style={{ background: 'var(--color-primary)' }}
    >
      {/* Decorative radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 70% 50%, var(--color-accent), transparent 65%)',
          opacity: 0.15,
        }}
      />

      <div className="relative mx-auto text-center" style={{ maxWidth: '680px' }}>
        <div
          className="w-10 h-1 rounded-full mx-auto mb-6"
          style={{ background: 'rgba(255,255,255,0.35)' }}
        />
        <h2
          className="text-3xl md:text-4xl font-bold text-white mb-5 leading-snug"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {config.title}
        </h2>
        <p
          className="text-base mb-10 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.72)' }}
        >
          {config.description}
        </p>
        <a
          href={config.buttonUrl}
          className="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-105 hover:shadow-lg"
          style={{
            background: 'var(--color-accent)',
            color: '#fff',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          }}
        >
          {config.buttonText}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
