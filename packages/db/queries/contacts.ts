import { SupabaseClient } from '@supabase/supabase-js';
import type { ContactSubmission } from '@siteforge/types';

export async function getContactSubmissions(supabase: SupabaseClient, siteId: string) {
  const { data } = await supabase
    .from('contact_submissions')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false });
  return (data ?? []) as ContactSubmission[];
}

export async function createContactSubmission(
  supabase: SupabaseClient,
  siteId: string,
  formData: Record<string, string>
) {
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert({ site_id: siteId, data: formData })
    .select()
    .single();
  if (error) throw error;
  return data as ContactSubmission;
}

export async function markContactRead(supabase: SupabaseClient, submissionId: string) {
  const { error } = await supabase
    .from('contact_submissions')
    .update({ is_read: true })
    .eq('id', submissionId);
  if (error) throw error;
}

export async function markAllContactsRead(supabase: SupabaseClient, siteId: string) {
  const { error } = await supabase
    .from('contact_submissions')
    .update({ is_read: true })
    .eq('site_id', siteId)
    .eq('is_read', false);
  if (error) throw error;
}
