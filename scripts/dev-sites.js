#!/usr/bin/env node
/**
 * 自動抓 Supabase 中所有站台，各別啟動一個 apps/site dev server
 * 從 3000 開始依序分配 port
 */

const path = require('path');
const { spawn } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({
  path: path.join(__dirname, '../apps/dashboard/.env.local'),
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const START_PORT = 3000;

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('找不到 Supabase 環境變數，請先填好 apps/dashboard/.env.local');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: sites, error } = await supabase
    .from('sites')
    .select('name, slug, status, domain')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('無法讀取站台列表：', error.message);
    process.exit(1);
  }

  if (!sites || sites.length === 0) {
    console.log('目前沒有任何站台，請先到 dashboard 新增一個。');
    return;
  }

  console.log('\n=== SiteForge 站台預覽 ===\n');

  const children = [];

  sites.forEach((site, i) => {
    const port = START_PORT + i;
    const status = site.status === 'active' ? '上線' : site.status === 'paused' ? '暫停' : '草稿';
    console.log(`  [${status}] ${site.name.padEnd(20)} → http://localhost:${port}  (slug: ${site.slug})`);

    const child = spawn('pnpm', ['--filter', '@siteforge/site', 'dev'], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        SITE_SLUG: site.slug,
        PORT: String(port),
      },
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const prefix = `[site:${site.slug}]`;

    child.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(Boolean);
      lines.forEach((line) => {
        if (line.includes('Ready') || line.includes('error') || line.includes('Error')) {
          console.log(`${prefix} ${line.trim()}`);
        }
      });
    });

    child.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) console.error(`${prefix} ${msg}`);
    });

    children.push(child);
  });

  console.log('\n啟動中，請稍候...\n');

  function cleanup() {
    children.forEach((c) => c.kill());
    process.exit(0);
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
