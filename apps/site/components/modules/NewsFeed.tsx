import { getPublishedNews, createServerClient } from '@siteforge/db';
import type { NewsConfig } from '@siteforge/types';

interface Props {
  siteId: string;
  config: NewsConfig;
}

export async function NewsFeed({ siteId, config }: Props) {
  const supabase = createServerClient();
  const items = await getPublishedNews(supabase, siteId, config.count);

  if (!items.length) return null;

  return (
    <section className="py-12 px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
        <h2
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
        >
          最新消息
        </h2>

        {config.layout === 'card' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-theme p-5 border"
                style={{
                  background: '#fff',
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--border-radius)',
                }}
              >
                {item.is_pinned && (
                  <span
                    className="inline-block text-xs font-semibold px-2 py-0.5 rounded mb-2"
                    style={{ background: 'var(--color-accent)', color: '#fff' }}
                  >
                    置頂
                  </span>
                )}
                <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--color-text)' }}>
                  {item.url ? <a href={item.url} className="hover:underline">{item.title}</a> : item.title}
                </h3>
                {config.showDate && (
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(item.published_at).toLocaleDateString('zh-TW')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {items.map((item) => (
              <li key={item.id} className="py-3 flex items-start gap-3">
                {item.is_pinned && (
                  <span
                    className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded mt-0.5"
                    style={{ background: 'var(--color-accent)', color: '#fff' }}
                  >
                    置頂
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {item.url ? <a href={item.url} className="hover:underline">{item.title}</a> : item.title}
                  </span>
                  {config.showDate && (
                    <span className="ml-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(item.published_at).toLocaleDateString('zh-TW')}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
