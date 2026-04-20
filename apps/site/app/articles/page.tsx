import Image from 'next/image';
import { getSiteConfig } from '@/lib/config';
import { getPublishedArticles, createServerClient } from '@siteforge/db';

export const revalidate = 3600;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const site = await getSiteConfig();
  const supabase = createServerClient();
  const allArticles = await getPublishedArticles(supabase, site.id, 100);

  const categories = Array.from(
    new Set(allArticles.map((a) => a.category).filter(Boolean))
  ) as string[];

  const selectedCategory = searchParams.category;
  const articles = selectedCategory
    ? allArticles.filter((a) => a.category === selectedCategory)
    : allArticles;

  const cardStyle = {
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--border-radius)',
    background: 'var(--color-surface)',
  };

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
        <h1
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
        >
          文章
        </h1>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <a
              href="/articles"
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
              style={
                !selectedCategory
                  ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                  : { background: 'transparent', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
              }
            >
              全部
            </a>
            {categories.map((cat) => (
              <a
                key={cat}
                href={`/articles?category=${encodeURIComponent(cat)}`}
                className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
                style={
                  selectedCategory === cat
                    ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                    : { background: 'transparent', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border)' }
                }
              >
                {cat}
              </a>
            ))}
          </div>
        )}

        {articles.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            此分類目前沒有文章。
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <a
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group block rounded-theme border overflow-hidden transition-shadow hover:shadow-md"
                style={cardStyle}
              >
                {article.cover_image && (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={article.cover_image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  {article.category && (
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      {article.category}
                    </span>
                  )}
                  <h2
                    className="font-semibold text-base mt-1 line-clamp-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {article.excerpt}
                    </p>
                  )}
                  {article.published_at && (
                    <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(article.published_at).toLocaleDateString('zh-TW')}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
