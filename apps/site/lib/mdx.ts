import { compileMDX } from 'next-mdx-remote/rsc';

export async function renderMdx(source: string) {
  const { content, frontmatter } = await compileMDX({
    source,
    options: { parseFrontmatter: true },
  });
  return { content, frontmatter };
}
