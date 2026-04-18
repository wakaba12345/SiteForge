import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { getMedia, createMediaRecord } from '@siteforge/db';

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
  return NextResponse.json(await getMedia(supabase as any, siteId));
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const siteId = formData.get('site_id') as string | null;

  if (!file || !siteId) return NextResponse.json({ error: 'file and site_id required' }, { status: 400 });
  if (!(await isOwner(supabase, siteId, user.id)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ext = file.name.split('.').pop();
  const storagePath = `${siteId}/${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const serviceClient = createServiceClient();
  const { error: uploadError } = await serviceClient.storage
    .from('media')
    .upload(storagePath, bytes, { contentType: file.type });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = serviceClient.storage.from('media').getPublicUrl(storagePath);

  const record = await createMediaRecord(serviceClient, {
    site_id: siteId,
    filename: file.name,
    storage_path: storagePath,
    url: publicUrl,
    mime_type: file.type,
    size_bytes: file.size,
    alt_text: null,
  });

  return NextResponse.json(record, { status: 201 });
}
