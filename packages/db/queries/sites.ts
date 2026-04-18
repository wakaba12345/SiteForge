import { SupabaseClient } from '@supabase/supabase-js';
import type { Site } from '@siteforge/types';

export async function getSiteByDomain(supabase: SupabaseClient, domain: string) {
  const { data } = await supabase
    .from('sites')
    .select('*')
    .eq('domain', domain)
    .eq('status', 'active')
    .single();
  return data as Site | null;
}

export async function getSiteBySlug(supabase: SupabaseClient, slug: string) {
  const { data } = await supabase
    .from('sites')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  return data as Site | null;
}

export async function getSitesByOwner(supabase: SupabaseClient, ownerId: string) {
  const { data } = await supabase
    .from('sites')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  return (data ?? []) as Site[];
}

export async function createSite(supabase: SupabaseClient, payload: {
  name: string;
  slug: string;
  owner_id: string;
}) {
  const { data, error } = await supabase
    .from('sites')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Site;
}

export async function updateSite(supabase: SupabaseClient, siteId: string, patch: Partial<Site>) {
  const { data, error } = await supabase
    .from('sites')
    .update(patch)
    .eq('id', siteId)
    .select()
    .single();
  if (error) throw error;
  return data as Site;
}

export async function deleteSite(supabase: SupabaseClient, siteId: string) {
  const { error } = await supabase.from('sites').delete().eq('id', siteId);
  if (error) throw error;
}
