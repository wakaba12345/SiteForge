import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getAdminSite } from '@/lib/admin-site';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const site = await getAdminSite();
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, status, category, tags, published_at, sort_order, cover_image, created_at')
    .eq('site_id', site.id)
    .order('created_at', { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const site = await getAdminSite();
  const body = await req.json();
  const { data, error } = await supabase
    .from('articles')
    .insert({ ...body, site_id: site.id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
