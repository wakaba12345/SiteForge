import type { FeaturesConfig } from '@siteforge/types';

interface Props { config: FeaturesConfig; }

export function FeaturesSection({ config }: Props) {
  if (!config.items?.length) return null;

  return (
    <section className="py-20 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
        <div className="text-center mb-14">
          <div className="w-10 h-1 rounded-full mx-auto mb-5"
            style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
          <h2 className="text-3xl font-bold"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
            {config.title || '為什麼選擇我們'}
          </h2>
        </div>

        <div className={`grid gap-6 ${
          config.items.length <= 2
            ? 'sm:grid-cols-2'
            : config.items.length === 4
            ? 'sm:grid-cols-2 lg:grid-cols-4'
            : 'sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {config.items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col p-7 rounded-xl border transition-shadow hover:shadow-md"
              style={{
                background: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--border-radius)',
              }}
            >
              <div className="mb-5">
                <span
                  className="block text-4xl font-black leading-none mb-2"
                  style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)', opacity: 0.7 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-8 h-0.5" style={{ background: 'var(--color-accent)' }} />
              </div>
              <h3
                className="font-bold text-lg mb-3 leading-snug"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
              >
                {item.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
