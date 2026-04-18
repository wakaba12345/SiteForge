import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getAdminSite } from '@/lib/admin-site';
import { supabase } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const site = await getAdminSite();
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .eq('site_id', site.id)
    .single();
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const site = await getAdminSite();
  const body = await req.json();
  const { data, error } = await supabase
    .from('articles')
    .update(body)
    .eq('id', params.id)
    .eq('site_id', site.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const site = await getAdminSite();
  await supabase.from('articles').delete().eq('id', params.id).eq('site_id', site.id);
  return NextResponse.json({ ok: true });
}
