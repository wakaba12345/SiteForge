import { SupabaseClient } from '@supabase/supabase-js';
import type { MarqueeItem } from '@siteforge/types';

export async function getActiveMarqueeItems(supabase: SupabaseClient, siteId: string) {
  const { data } = await supabase
    .from('marquee_items')
    .select('*')
    .eq('site_id', siteId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as MarqueeItem[];
}

export async function getAllMarqueeItems(supabase: SupabaseClient, siteId: string) {
  const { data } = await supabase
    .from('marquee_items')
    .select('*')
    .eq('site_id', siteId)
    .order('sort_order', { ascending: true });
  return (data ?? []) as MarqueeItem[];
}

export async function createMarqueeItem(supabase: SupabaseClient, payload: Omit<MarqueeItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('marquee_items').insert(payload).select().single();
  if (error) throw error;
  return data as MarqueeItem;
}

export async function updateMarqueeItem(supabase: SupabaseClient, itemId: string, patch: Partial<MarqueeItem>) {
  const { data, error } = await supabase
    .from('marquee_items')
    .update(patch)
    .eq('id', itemId)
    .select()
    .single();
  if (error) throw error;
  return data as MarqueeItem;
}

export async function deleteMarqueeItem(supabase: SupabaseClient, itemId: string) {
  const { error } = await supabase.from('marquee_items').delete().eq('id', itemId);
  if (error) throw error;
}
