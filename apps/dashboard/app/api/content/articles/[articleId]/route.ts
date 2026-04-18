import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { updateArticle, deleteArticle } from '@siteforge/db';

async function getOwned(supabase: any, articleId: string, userId: string) {
  const { data } = await supabase
    .from('articles')
    .select('*, sites!inner(owner_id)')
    .eq('id', articleId)
    .eq('sites.owner_id', userId)
    .single();
  return data;
}

export async function GET(_req: NextRequest, { params }: { params: { articleId: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const article = await getOwned(supabase, params.articleId, user.id);
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(req: NextRequest, { params }: { params: { articleId: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const article = await getOwned(supabase, params.articleId, user.id);
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const patch = await req.json();
  const updated = await updateArticle(createServiceClient(), params.articleId, patch);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { articleId: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const article = await getOwned(supabase, params.articleId, user.id);
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteArticle(createServiceClient(), params.articleId);
  return NextResponse.json({ success: true });
}
