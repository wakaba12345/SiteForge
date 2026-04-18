import Image from 'next/image';
import { getPublishedArticles, createServerClient } from '@siteforge/db';
import type { ArticlesConfig } from '@siteforge/types';

interface Props {
  siteId: string;
  config: ArticlesConfig;
}

export async function ArticleGrid({ siteId, config }: Props) {
  const supabase = createServerClient();
  const articles = await getPublishedArticles(supabase, siteId, config.perPage);

  if (!articles.length) return null;

  return (
    <section className="py-12 px-6">
      <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
        <h2
          className="text-2xl font-bold mb-6"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
        >
          文章
        </h2>

        <div
          className={
            config.layout === 'list'
              ? 'flex flex-col gap-6'
              : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
          }
        >
          {articles.map((article) => (
            <a
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group block rounded-theme overflow-hidden border transition-shadow hover:shadow-md"
              style={{
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--border-radius)',
                background: 'var(--color-surface)',
              }}
            >
              {config.showCover && article.cover_image && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={article.cover_image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <h3
                  className="font-semibold text-base mb-1 line-clamp-2"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
                >
                  {article.title}
                </h3>
                {config.showExcerpt && article.excerpt && (
                  <p className="text-sm line-clamp-2 mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {article.excerpt}
                  </p>
                )}
                {article.published_at && (
                  <p className="text-xs mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(article.published_at).toLocaleDateString('zh-TW')}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
