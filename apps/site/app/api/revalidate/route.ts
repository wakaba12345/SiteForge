import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidation-secret');
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { paths } = await req.json().catch(() => ({}));
  const targets: string[] = Array.isArray(paths) && paths.length > 0 ? paths : ['/'];

  for (const path of targets) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: targets });
}
