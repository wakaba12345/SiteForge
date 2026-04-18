import { SupabaseClient } from '@supabase/supabase-js';
import type { Article } from '@siteforge/types';

export async function getPublishedArticles(supabase: SupabaseClient, siteId: string, limit = 50) {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('site_id', siteId)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as Article[];
}

export async function getArticleBySlug(supabase: SupabaseClient, siteId: string, slug: string) {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('site_id', siteId)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return data as Article | null;
}

export async function getAllArticles(supabase: SupabaseClient, siteId: string) {
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });
  return (data ?? []) as Article[];
}

export async function createArticle(supabase: SupabaseClient, payload: Omit<Article, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('articles').insert(payload).select().single();
  if (error) throw error;
  return data as Article;
}

export async function updateArticle(supabase: SupabaseClient, articleId: string, patch: Partial<Article>) {
  const { data, error } = await supabase
    .from('articles')
    .update(patch)
    .eq('id', articleId)
    .select()
    .single();
  if (error) throw error;
  return data as Article;
}

export async function deleteArticle(supabase: SupabaseClient, articleId: string) {
  const { error } = await supabase.from('articles').delete().eq('id', articleId);
  if (error) throw error;
}
