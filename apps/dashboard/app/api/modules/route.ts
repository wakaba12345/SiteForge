import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] ?? {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

async function getOwnedSite(supabase: any, siteId: string, userId: string) {
  const { data } = await supabase.from('sites').select('id, module_config, owner_id').eq('id', siteId).eq('owner_id', userId).single();
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
  return NextResponse.json(site.module_config);
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
  const merged = deepMerge(site.module_config, patch);
  await createServiceClient().from('sites').update({ module_config: merged }).eq('id', siteId);

  // Trigger revalidation
  fetch(`${process.env.REVALIDATION_TARGET_URL ?? ''}/api/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-revalidation-secret': process.env.REVALIDATION_SECRET ?? '' },
    body: JSON.stringify({ paths: ['/'] }),
  }).catch(() => {});

  return NextResponse.json(merged);
}
