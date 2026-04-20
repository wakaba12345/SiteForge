import type { ProcessConfig } from '@siteforge/types';

export function ProcessSection({ config }: { config: ProcessConfig }) {
  if (!config.steps?.length) return null;

  const cols = Math.min(config.steps.length, 4);

  return (
    <section className="py-20 px-6" style={{ background: 'var(--color-bg)' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
        <div className="text-center mb-14">
          <div
            className="w-10 h-1 rounded-full mx-auto mb-5"
            style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
          />
          <h2
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
          >
            {config.title || '服務流程'}
          </h2>
        </div>

        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            display: 'grid',
            gap: '2rem',
          }}
        >
          {config.steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center relative">
              {/* Connector arrow */}
              {i < config.steps.length - 1 && (
                <div
                  className="absolute"
                  style={{ right: '-1rem', top: '1.6rem', color: 'var(--color-border)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}

              {/* Number badge */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-5 text-lg font-black shrink-0"
                style={{
                  background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                  color: '#fff',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>

              <h3
                className="font-bold text-base mb-2 leading-snug"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
