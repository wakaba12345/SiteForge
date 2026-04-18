import { supabase } from './supabase';

export async function getAdminSite() {
  const slug = process.env.SITE_SLUG;
  if (!slug) throw new Error('SITE_SLUG not configured');
  const { data, error } = await supabase
    .from('sites')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();
  if (error || !data) throw new Error('Site not found');
  return data as { id: string; name: string; slug: string };
}
