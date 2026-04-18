import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';

async function getOwnedSite(supabase: any, siteId: string, userId: string) {
  const { data } = await supabase.from('sites').select('id, theme_config, owner_id').eq('id', siteId).eq('owner_id', userId).single();
  return data;
}

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get('siteId');
  if (!siteId) return NextResponse.json({ error: 'siteId required' }, { status: 400 });
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const site = await getOwnedSite(supabase, siteId, user.id);
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(site.theme_config);
}

export async function PATCH(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get('siteId');
  if (!siteId) return NextResponse.json({ error: 'siteId required' }, { status: 400 });
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const site = await getOwnedSite(supabase, siteId, user.id);
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const patch = await req.json();
  const merged = { ...site.theme_config, ...patch };
  await createServiceClient().from('sites').update({ theme_config: merged }).eq('id', siteId);
  return NextResponse.json(merged);
}
