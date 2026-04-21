import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { randomBytes } from 'node:crypto';

const VERCEL_API = 'https://api.vercel.com';
const GITHUB_ORG = 'wakaba12345';
const GITHUB_REPO = 'SiteForge';

function headers() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error('VERCEL_TOKEN not set');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function tq() {
  const id = process.env.VERCEL_TEAM_ID;
  return id ? `?teamId=${id}` : '';
}

export async function POST(_req: NextRequest, { params }: { params: { siteId: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: site } = await supabase
    .from('sites')
    .select('id, name, slug, seo_config')
    .eq('id', params.siteId)
    .eq('owner_id', user.id)
    .single();
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (!process.env.VERCEL_TOKEN) {
    return NextResponse.json({ error: '請先在 Dashboard 設定 VERCEL_TOKEN 環境變數' }, { status: 500 });
  }

  const projectName = `siteforge-${site.slug}`;
  const h = headers();
  const q = tq();
  const seo = (site.seo_config as any) ?? {};

  const adminPassword = seo.admin_password || randomBytes(12).toString('base64url');
  const adminHmacSecret = seo.admin_hmac_secret || randomBytes(16).toString('hex');

  // Find or create Vercel project
  let projectId: string = seo.vercel_project_id ?? '';

  if (!projectId) {
    const checkRes = await fetch(`${VERCEL_API}/v10/projects/${projectName}${q}`, { headers: h });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      projectId = existing.id;
    }
  }

  if (!projectId) {
    const createRes = await fetch(`${VERCEL_API}/v10/projects${q}`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        name: projectName,
        framework: 'nextjs',
        gitRepository: { type: 'github', repo: `${GITHUB_ORG}/${GITHUB_REPO}` },
        rootDirectory: 'apps/site',
        buildCommand: 'pnpm --filter @siteforge/site build',
        installCommand: 'pnpm install --frozen-lockfile',
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.json();
      return NextResponse.json(
        { error: `建立 Vercel 專案失敗: ${err.error?.message ?? JSON.stringify(err)}` },
        { status: 500 }
      );
    }
    projectId = (await createRes.json()).id;
  }

  // Upsert env vars (delete existing matching keys first)
  const envVars = [
    { key: 'SITE_SLUG', value: site.slug },
    { key: 'ADMIN_PASSWORD', value: adminPassword },
    { key: 'ADMIN_HMAC_SECRET', value: adminHmacSecret },
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL! },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY! },
    { key: 'REVALIDATION_SECRET', value: process.env.REVALIDATION_SECRET ?? 'siteforge-revalidate' },
  ].map((e) => ({ ...e, type: 'plain', target: ['production'] }));

  const existingEnvRes = await fetch(`${VERCEL_API}/v10/projects/${projectId}/env${q}`, { headers: h });
  if (existingEnvRes.ok) {
    const { envs } = await existingEnvRes.json() as { envs: Array<{ id: string; key: string }> };
    const keys = envVars.map((e) => e.key);
    await Promise.all(
      envs
        .filter((e) => keys.includes(e.key))
        .map((e) => fetch(`${VERCEL_API}/v10/projects/${projectId}/env/${e.id}${q}`, { method: 'DELETE', headers: h }))
    );
  }

  const envRes = await fetch(`${VERCEL_API}/v10/projects/${projectId}/env${q}`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify(envVars),
  });
  if (!envRes.ok) {
    const err = await envRes.json();
    return NextResponse.json(
      { error: `設定環境變數失敗: ${err.error?.message ?? JSON.stringify(err)}` },
      { status: 500 }
    );
  }

  // Trigger deployment
  const deployRes = await fetch(`${VERCEL_API}/v13/deployments${q}`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      name: projectName,
      gitSource: { type: 'github', org: GITHUB_ORG, repo: GITHUB_REPO, ref: 'main' },
      project: projectId,
    }),
  });
  if (!deployRes.ok) {
    const err = await deployRes.json();
    return NextResponse.json(
      { error: `部署觸發失敗: ${err.error?.message ?? JSON.stringify(err)}` },
      { status: 500 }
    );
  }
  await deployRes.json();
  const deployUrl = `https://${projectName}.vercel.app`;

  // Persist vercel metadata in seo_config
  await createServiceClient()
    .from('sites')
    .update({
      seo_config: {
        ...seo,
        vercel_project_id: projectId,
        vercel_url: deployUrl,
        admin_password: adminPassword,
        admin_hmac_secret: adminHmacSecret,
      },
    })
    .eq('id', params.siteId);

  return NextResponse.json({ ok: true, url: deployUrl, projectId, adminPassword });
}
