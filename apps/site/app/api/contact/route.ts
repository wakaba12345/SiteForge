import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@siteforge/db';
import { createContactSubmission } from '@siteforge/db';

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  rateLimitMap.set(ip, hits);
  return hits.length > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.site_id || !body?.data || typeof body.data !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = createServerClient();
  await createContactSubmission(supabase, body.site_id, body.data);

  return NextResponse.json({ ok: true });
}
