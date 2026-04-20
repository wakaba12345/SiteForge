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

  const sectionStyle = { maxWidth: 'var(--max-width)' };
  const headingStyle = { fontFamily: 'var(--font-heading)', color: 'var(--color-text)' };
  const cardStyle = { borderColor: 'var(--color-border)', borderRadius: 'var(--border-radius)', background: 'var(--color-surface)' };

  // ── Magazine layout ──
  if (config.layout === 'magazine' && articles.length > 1) {
    const [featured, ...rest] = articles;
    return (
      <section className="py-12 px-6">
        <div className="mx-auto" style={sectionStyle}>
          <h2 className="text-2xl font-bold mb-6" style={headingStyle}>文章</h2>

          {/* Featured */}
          <a href={`/articles/${featured.slug}`}
            className="group flex flex-col md:flex-row gap-0 rounded-xl overflow-hidden border mb-6 transition-shadow hover:shadow-lg"
            style={cardStyle}>
            {config.showCover && featured.cover_image && (
              <div className="relative md:w-1/2 aspect-video md:aspect-auto overflow-hidden">
                <Image src={featured.cover_image} alt={featured.title} fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            )}
            <div className="flex-1 flex flex-col justify-center p-6 md:p-8">
              {featured.category && (
                <span className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--color-accent)' }}>{featured.category}</span>
              )}
              <h3 className="text-xl md:text-2xl font-bold mb-3 leading-snug"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                {featured.title}
              </h3>
              {config.showExcerpt && featured.excerpt && (
                <p className="text-sm line-clamp-3 mb-4" style={{ color: 'var(--color-text-secondary)' }}>{featured.excerpt}</p>
              )}
              {featured.published_at && (
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(featured.published_at).toLocaleDateString('zh-TW')}
                </p>
              )}
            </div>
          </a>

          {/* Rest in grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <a key={article.id} href={`/articles/${article.slug}`}
                className="group block rounded-xl overflow-hidden border transition-shadow hover:shadow-md"
                style={cardStyle}>
                {config.showCover && article.cover_image && (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image src={article.cover_image} alt={article.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-4">
                  {article.category && (
                    <span className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--color-accent)' }}>{article.category}</span>
                  )}
                  <h3 className="font-semibold text-base mt-1 mb-1 line-clamp-2"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                    {article.title}
                  </h3>
                  {config.showExcerpt && article.excerpt && (
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{article.excerpt}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Features layout ──
  if (config.layout === 'features') {
    return (
      <section className="py-20 px-6" style={{ background: 'var(--color-bg)' }}>
        <div className="mx-auto" style={sectionStyle}>
          <div className="text-center mb-14">
            <div className="w-10 h-1 rounded-full mx-auto mb-5"
              style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }} />
            <h2 className="text-3xl font-bold" style={headingStyle}>我們的服務與優勢</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, i) => (
              <a key={article.id} href={`/articles/${article.slug}`}
                className="group flex flex-col p-7 rounded-xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                style={{ ...cardStyle, background: 'var(--color-surface)' }}>
                <div className="mb-5">
                  <span
                    className="block text-4xl font-black leading-none mb-2"
                    style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)', opacity: 0.7 }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-8 h-0.5" style={{ background: 'var(--color-accent)' }} />
                </div>
                {article.category && (
                  <span className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: 'var(--color-accent)' }}>{article.category}</span>
                )}
                <h3 className="font-bold text-lg mb-3 leading-snug"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                  {article.title}
                </h3>
                {config.showExcerpt && article.excerpt && (
                  <p className="text-sm leading-relaxed flex-1 line-clamp-4"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    {article.excerpt}
                  </p>
                )}
                <div className="mt-5 flex items-center gap-1 text-sm font-semibold transition-colors"
                  style={{ color: 'var(--color-primary)' }}>
                  <span>了解更多</span>
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── List layout ──
  if (config.layout === 'list') {
    return (
      <section className="py-12 px-6">
        <div className="mx-auto" style={sectionStyle}>
          <h2 className="text-2xl font-bold mb-6" style={headingStyle}>文章</h2>
          <div className="flex flex-col gap-5">
            {articles.map((article) => (
              <a key={article.id} href={`/articles/${article.slug}`}
                className="group flex gap-5 rounded-xl overflow-hidden border p-5 transition-shadow hover:shadow-md"
                style={cardStyle}>
                {config.showCover && article.cover_image && (
                  <div className="relative w-32 h-24 shrink-0 overflow-hidden rounded-lg">
                    <Image src={article.cover_image} alt={article.title} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {article.category && (
                    <span className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--color-accent)' }}>{article.category}</span>
                  )}
                  <h3 className="font-semibold text-base mt-1 line-clamp-2"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                    {article.title}
                  </h3>
                  {config.showExcerpt && article.excerpt && (
                    <p className="text-sm line-clamp-2 mt-1" style={{ color: 'var(--color-text-secondary)' }}>{article.excerpt}</p>
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
        </div>
      </section>
    );
  }

  // ── Grid layout (default) ──
  return (
    <section className="py-12 px-6">
      <div className="mx-auto" style={sectionStyle}>
        <h2 className="text-2xl font-bold mb-6" style={headingStyle}>文章</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <a key={article.id} href={`/articles/${article.slug}`}
              className="group block rounded-xl overflow-hidden border transition-shadow hover:shadow-md"
              style={cardStyle}>
              {config.showCover && article.cover_image && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image src={article.cover_image} alt={article.title} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-4">
                {article.category && (
                  <span className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-accent)' }}>{article.category}</span>
                )}
                <h3 className="font-semibold text-base mt-1 mb-1 line-clamp-2"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
                  {article.title}
                </h3>
                {config.showExcerpt && article.excerpt && (
                  <p className="text-sm line-clamp-2 mt-1" style={{ color: 'var(--color-text-secondary)' }}>{article.excerpt}</p>
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
