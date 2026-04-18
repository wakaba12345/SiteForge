import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { siteId, paths } = await req.json();
  if (!siteId) return NextResponse.json({ error: 'siteId required' }, { status: 400 });

  const { data: site } = await supabase
    .from('sites')
    .select('domain, slug, owner_id')
    .eq('id', siteId)
    .eq('owner_id', user.id)
    .single();

  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const targetUrl = process.env.REVALIDATION_TARGET_URL;
  if (!targetUrl) return NextResponse.json({ skipped: true });

  await fetch(`${targetUrl}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-revalidation-secret': process.env.REVALIDATION_SECRET ?? '',
    },
    body: JSON.stringify({ paths: paths ?? ['/'] }),
  });

  return NextResponse.json({ ok: true });
}
