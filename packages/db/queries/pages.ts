import { SupabaseClient } from '@supabase/supabase-js';
import type { Page } from '@siteforge/types';

export async function getPublishedPages(supabase: SupabaseClient, siteId: string) {
  const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('site_id', siteId)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as Page[];
}

export async function getPageBySlug(supabase: SupabaseClient, siteId: string, slug: string) {
  const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('site_id', siteId)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();
  return data as Page | null;
}

export async function getAllPages(supabase: SupabaseClient, siteId: string) {
  const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('site_id', siteId)
    .order('sort_order', { ascending: true });
  return (data ?? []) as Page[];
}

export async function createPage(
  supabase: SupabaseClient,
  payload: Omit<Page, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase.from('pages').insert(payload).select().single();
  if (error) throw error;
  return data as Page;
}

export async function updatePage(
  supabase: SupabaseClient,
  pageId: string,
  patch: Partial<Page>
) {
  const { data, error } = await supabase
    .from('pages')
    .update(patch)
    .eq('id', pageId)
    .select()
    .single();
  if (error) throw error;
  return data as Page;
}

export async function deletePage(supabase: SupabaseClient, pageId: string) {
  const { error } = await supabase.from('pages').delete().eq('id', pageId);
  if (error) throw error;
}
