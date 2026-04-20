import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { getAdminSite } from '@/lib/admin-site';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const site = await getAdminSite();
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });

  const ext = file.name.split('.').pop() || 'bin';
  const storagePath = `${site.id}/${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(storagePath, bytes, { contentType: file.type });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(storagePath);

  await supabase.from('media').insert({
    site_id: site.id,
    filename: file.name,
    storage_path: storagePath,
    url: publicUrl,
    mime_type: file.type,
    size_bytes: file.size,
  });

  return NextResponse.json({ url: publicUrl });
}
