import Image from 'next/image';
import { getSiteConfig } from '@/lib/config';
import { getPublishedArticles, createServerClient } from '@siteforge/db';

export const revalidate = 3600;

export default async function ArticlesPage() {
  const site = await getSiteConfig();
  const supabase = createServerClient();
  const articles = await getPublishedArticles(supabase, site.id, 50);

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
        <h1
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
        >
          文章
        </h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <a
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group block rounded-theme border overflow-hidden transition-shadow hover:shadow-md"
              style={{
                borderColor: 'var(--color-border)',
                borderRadius: 'var(--border-radius)',
                background: 'var(--color-surface)',
              }}
            >
              {article.cover_image && (
                <div className="relative aspect-video">
                  <Image src={article.cover_image} alt={article.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-4">
                <h2
                  className="font-semibold text-base line-clamp-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {article.title}
                </h2>
                {article.excerpt && (
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {article.excerpt}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
