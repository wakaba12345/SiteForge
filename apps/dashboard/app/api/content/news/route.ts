import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { getAllNews, createNews } from '@siteforge/db';

async function isOwner(supabase: any, siteId: string, userId: string) {
  const { data } = await supabase.from('sites').select('id').eq('id', siteId).eq('owner_id', userId).single();
  return !!data;
}

export async function GET(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get('siteId');
  if (!siteId) return NextResponse.json({ error: 'siteId required' }, { status: 400 });
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isOwner(supabase, siteId, user.id)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getAllNews(supabase as any, siteId));
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  if (!(await isOwner(supabase, body.site_id, user.id)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const item = await createNews(createServiceClient(), body);
  return NextResponse.json(item, { status: 201 });
}
