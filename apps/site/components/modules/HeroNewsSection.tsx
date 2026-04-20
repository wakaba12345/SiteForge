import { getPublishedNews, createServerClient } from '@siteforge/db';
import type { HeroConfig, NewsConfig } from '@siteforge/types';

interface Props {
  heroConfig: HeroConfig;
  newsConfig: NewsConfig;
  siteId: string;
}

export async function HeroNewsSection({ heroConfig, newsConfig, siteId }: Props) {
  const supabase = createServerClient();
  const newsItems = await getPublishedNews(supabase, siteId, 5);

  return (
    <section
      style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
    >
      <div
        className="flex flex-col md:grid"
        style={{ maxWidth: 'var(--max-width)', margin: '0 auto', gridTemplateColumns: '1fr 360px', minHeight: '440px' }}
      >
        {/* ── Left: Hero ── */}
        <div className="flex items-center px-6 py-16 md:py-20 md:pr-12">
          <div>
            <div
              className="mb-6"
              style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--color-accent)' }}
            />
            {heroConfig.title && (
              <h1
                className="mb-5 leading-tight"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                }}
              >
                {heroConfig.title}
              </h1>
            )}
            {heroConfig.subtitle && (
              <p
                className="mb-8 leading-relaxed"
                style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}
              >
                {heroConfig.subtitle}
              </p>
            )}
            {heroConfig.ctaText && heroConfig.ctaUrl && (
              <div className="flex flex-wrap gap-3">
                <a
                  href={heroConfig.ctaUrl}
                  className="inline-block font-bold transition-opacity hover:opacity-85"
                  style={{
                    background: 'var(--color-primary)',
                    color: '#fff',
                    padding: '0.75rem 2rem',
                    borderRadius: 'var(--border-radius)',
                    fontSize: '0.95rem',
                  }}
                >
                  {heroConfig.ctaText}
                </a>
                <a
                  href="/contact"
                  className="inline-block font-bold transition-opacity hover:opacity-85"
                  style={{
                    border: '2px solid var(--color-primary)',
                    color: 'var(--color-primary)',
                    padding: '0.75rem 2rem',
                    borderRadius: 'var(--border-radius)',
                    fontSize: '0.95rem',
                    background: 'transparent',
                  }}
                >
                  免費諮詢
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: News sidebar ── */}
        {newsItems.length > 0 && (
          <div
            className="border-t md:border-t-0 md:border-l px-6 py-10 md:py-12"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between mb-4 pb-3"
              style={{ borderBottom: '2px solid var(--color-primary)' }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--color-text)',
                }}
              >
                最新消息
              </h2>
              <a
                href="/news"
                style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}
              >
                更多 →
              </a>
            </div>

            {/* News items */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {newsItems.map((item, i) => (
                <li
                  key={item.id}
                  style={{
                    padding: '0.85rem 0',
                    borderBottom: i < newsItems.length - 1
                      ? '1px solid var(--color-border)'
                      : 'none',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--color-accent)',
                      fontWeight: 600,
                      marginBottom: '0.2rem',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {new Date(item.published_at).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </p>
                  <p
                    className="line-clamp-2"
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-text)',
                      lineHeight: 1.55,
                      fontWeight: 500,
                    }}
                  >
                    {item.url ? (
                      <a href={item.url} className="hover:underline" style={{ color: 'inherit' }}>
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
