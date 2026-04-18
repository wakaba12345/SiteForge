import { SupabaseClient } from '@supabase/supabase-js';
import type { MediaItem } from '@siteforge/types';

export async function getMedia(supabase: SupabaseClient, siteId: string) {
  const { data } = await supabase
    .from('media')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });
  return (data ?? []) as MediaItem[];
}

export async function createMediaRecord(supabase: SupabaseClient, payload: Omit<MediaItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('media').insert(payload).select().single();
  if (error) throw error;
  return data as MediaItem;
}

export async function deleteMediaRecord(supabase: SupabaseClient, mediaId: string) {
  const { error } = await supabase.from('media').delete().eq('id', mediaId);
  if (error) throw error;
}
