import { getSiteConfig } from '@/lib/config';
import { getPublishedNews, createServerClient } from '@siteforge/db';

export const revalidate = 3600;

export default async function NewsPage() {
  const site = await getSiteConfig();
  const supabase = createServerClient();
  const items = await getPublishedNews(supabase, site.id, 50);

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
        <h1
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
        >
          最新消息
        </h1>
        <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {items.map((item) => (
            <li key={item.id} className="py-4 flex items-start gap-3">
              {item.is_pinned && (
                <span
                  className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded mt-0.5"
                  style={{ background: 'var(--color-accent)', color: '#fff' }}
                >
                  置頂
                </span>
              )}
              <div>
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {item.url ? <a href={item.url} className="hover:underline">{item.title}</a> : item.title}
                </p>
                {item.content && (
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.content}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(item.published_at).toLocaleDateString('zh-TW')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
