import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteConfig } from '@/lib/config';
import { getArticleBySlug, createServerClient } from '@siteforge/db';
import { renderMdx } from '@/lib/mdx';

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSiteConfig();
  const supabase = createServerClient();
  const article = await getArticleBySlug(supabase, site.id, params.slug);
  if (!article) return {};
  const baseUrl = site.domain ? `https://${site.domain}` : '';
  return {
    title: `${article.seo_title ?? article.title} — ${site.seo_config.title}`,
    description: article.seo_description ?? article.excerpt ?? site.seo_config.description,
    openGraph: {
      title: article.seo_title ?? article.title,
      description: article.seo_description ?? article.excerpt ?? site.seo_config.description,
      url: `${baseUrl}/articles/${article.slug}`,
      ...(article.cover_image && { images: [{ url: article.cover_image }] }),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const site = await getSiteConfig();
  const supabase = createServerClient();
  const article = await getArticleBySlug(supabase, site.id, params.slug);

  if (!article) notFound();

  const isHtml = article.content.trimStart().startsWith('<');
  const mdxResult = isHtml ? null : await renderMdx(article.content);
  const content = mdxResult?.content ?? null;

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
          {isHtml
            ? <div dangerouslySetInnerHTML={{ __html: article.content }} />
            : content}
        </div>
      </article>
    </main>
  );
}
