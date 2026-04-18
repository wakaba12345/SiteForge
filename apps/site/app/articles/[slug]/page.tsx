import { notFound } from 'next/navigation';
import { getSiteConfig } from '@/lib/config';
import { getArticleBySlug, createServerClient } from '@siteforge/db';
import { renderMdx } from '@/lib/mdx';

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export default async function ArticlePage({ params }: Props) {
  const site = await getSiteConfig();
  const supabase = createServerClient();
  const article = await getArticleBySlug(supabase, site.id, params.slug);

  if (!article) notFound();

  const { content } = await renderMdx(article.content);

  return (
    <main className="min-h-screen py-12 px-6">
      <article className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}
          >
            {article.title}
          </h1>
          {article.published_at && (
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {new Date(article.published_at).toLocaleDateString('zh-TW')}
            </p>
          )}
        </header>
        <div
          className="prose prose-lg max-w-none"
          style={{ color: 'var(--color-text)', lineHeight: 'var(--line-height)' }}
        >
          {content}
        </div>
      </article>
    </main>
  );
}
