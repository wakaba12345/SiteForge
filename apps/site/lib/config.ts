import { headers } from 'next/headers';
import { supabase } from './supabase';
import type { Site } from '@siteforge/types';

export async function getSiteConfig(): Promise<Site> {
  const host = headers().get('host') ?? '';

  let { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('domain', host)
    .neq('status', 'paused')
    .single();

  if (!site) {
    const slug = process.env.SITE_SLUG;
    if (!slug) throw new Error('No SITE_SLUG configured');

    const { data } = await supabase
      .from('sites')
      .select('*')
      .eq('slug', slug)
      .neq('status', 'paused')
      .single();

    site = data;
  }

  if (!site) throw new Error('Site not found or inactive');
  return site as Site;
}
