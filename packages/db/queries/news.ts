import { SupabaseClient } from '@supabase/supabase-js';
import type { NewsItem } from '@siteforge/types';

export async function getPublishedNews(supabase: SupabaseClient, siteId: string, limit = 20) {
  const { data } = await supabase
    .from('news')
    .select('*')
    .eq('site_id', siteId)
    .eq('status', 'published')
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as NewsItem[];
}

export async function getAllNews(supabase: SupabaseClient, siteId: string) {
  const { data } = await supabase
    .from('news')
    .select('*')
    .eq('site_id', siteId)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false });
  return (data ?? []) as NewsItem[];
}

export async function createNews(supabase: SupabaseClient, payload: Omit<NewsItem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('news').insert(payload).select().single();
  if (error) throw error;
  return data as NewsItem;
}

export async function updateNews(supabase: SupabaseClient, newsId: string, patch: Partial<NewsItem>) {
  const { data, error } = await supabase
    .from('news')
    .update(patch)
    .eq('id', newsId)
    .select()
    .single();
  if (error) throw error;
  return data as NewsItem;
}

export async function deleteNews(supabase: SupabaseClient, newsId: string) {
  const { error } = await supabase.from('news').delete().eq('id', newsId);
  if (error) throw error;
}
