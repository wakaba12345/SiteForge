import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { updateNews, deleteNews } from '@siteforge/db';

async function getOwned(supabase: any, newsId: string, userId: string) {
  const { data } = await supabase
    .from('news')
    .select('*, sites!inner(owner_id)')
    .eq('id', newsId)
    .eq('sites.owner_id', userId)
    .single();
  return data;
}

export async function PATCH(req: NextRequest, { params }: { params: { newsId: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const item = await getOwned(supabase, params.newsId, user.id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const patch = await req.json();
  return NextResponse.json(await updateNews(createServiceClient(), params.newsId, patch));
}

export async function DELETE(_req: NextRequest, { params }: { params: { newsId: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const item = await getOwned(supabase, params.newsId, user.id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteNews(createServiceClient(), params.newsId);
  return NextResponse.json({ success: true });
}
