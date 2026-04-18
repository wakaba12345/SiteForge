import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { updateMarqueeItem, deleteMarqueeItem } from '@siteforge/db';

async function getOwned(supabase: any, itemId: string, userId: string) {
  const { data } = await supabase
    .from('marquee_items')
    .select('*, sites!inner(owner_id)')
    .eq('id', itemId)
    .eq('sites.owner_id', userId)
    .single();
  return data;
}

export async function PATCH(req: NextRequest, { params }: { params: { itemId: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const item = await getOwned(supabase, params.itemId, user.id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const patch = await req.json();
  return NextResponse.json(await updateMarqueeItem(createServiceClient(), params.itemId, patch));
}

export async function DELETE(_req: NextRequest, { params }: { params: { itemId: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const item = await getOwned(supabase, params.itemId, user.id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteMarqueeItem(createServiceClient(), params.itemId);
  return NextResponse.json({ success: true });
}
