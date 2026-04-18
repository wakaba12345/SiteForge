import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { updateSite, deleteSite } from '@siteforge/db';

async function getAuthorizedSite(supabase: any, siteId: string, userId: string) {
  const { data } = await supabase.from('sites').select('*').eq('id', siteId).eq('owner_id', userId).single();
  return data;
}

export async function GET(_req: NextRequest, { params }: { params: { siteId: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const site = await getAuthorizedSite(supabase, params.siteId, user.id);
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(site);
}

export async function PATCH(req: NextRequest, { params }: { params: { siteId: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await getAuthorizedSite(supabase, params.siteId, user.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const patch = await req.json();
  const updated = await updateSite(createServiceClient(), params.siteId, patch);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { siteId: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await getAuthorizedSite(supabase, params.siteId, user.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteSite(createServiceClient(), params.siteId);
  return NextResponse.json({ success: true });
}
