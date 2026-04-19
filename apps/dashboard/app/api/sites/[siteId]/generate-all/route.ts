import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `你是一個專業的網站內容生成助理。根據用戶描述，生成一個完整的繁體中文網站內容。

重要：只輸出 JSON 物件，第一個字元必須是 {，最後一個字元必須是 }，不要有任何 markdown、程式碼區塊、說明文字或前言。

輸出格式如下：
{
  "layout": {
    "heroLayout": "<centered|split|minimal>",
    "articlesLayout": "<grid|list|magazine>",
    "newsLayout": "<list|card>"
  },
  "theme": {
    "colors": {
      "primary": "<hex>",
      "accent": "<hex>",
      "background": "<hex>",
      "surface": "<hex>",
      "text": "<hex>",
      "textSecondary": "<hex>",
      "border": "<hex>"
    },
    "typography": {
      "headingFont": "<Google Font>",
      "bodyFont": "<Google Font>",
      "baseFontSize": "16px",
      "headingWeight": "700",
      "lineHeight": "1.6"
    },
    "layout": {
      "maxWidth": "1200px",
      "borderRadius": "<0px|8px|16px>",
      "spacing": "1.5rem",
      "headerStyle": "fixed"
    }
  },
  "hero": {
    "title": "<主標題，10字以內>",
    "subtitle": "<副標題，20-30字>",
    "ctaText": "<按鈕文字，5字以內>",
    "ctaUrl": "/contact"
  },
  "articles": [
    {
      "title": "<文章標題>",
      "slug": "<英文slug>",
      "category": "<分類>",
      "excerpt": "<100字以內摘要>",
      "content": "<完整HTML內文，至少300字，用<h2><p><ul>等標籤>"
    }
  ],
  "news": [
    {
      "title": "<消息標題>",
      "content": "<50-100字內文>"
    }
  ],
  "marquee": ["<跑馬燈文字1>", "<跑馬燈文字2>", "<跑馬燈文字3>", "<跑馬燈文字4>", "<跑馬燈文字5>"]
}

版型選擇規則（依業種判斷）：
- heroLayout:
  - "split"：適合專業服務（律師、會計、顧問、醫療、金融）→ 左文右色塊，商務感強
  - "minimal"：適合設計、科技、個人品牌、攝影 → 簡潔大字、大量留白
  - "centered"：適合餐飲、零售、一般商家 → 漸層底色，視覺衝擊強
- articlesLayout:
  - "magazine"：適合需要突出「關於我們」的業種（律師、診所、顧問）→ 第一篇大圖特顯
  - "grid"：適合產品、服務項目多的業種
  - "list"：適合部落格、新聞、內容較多的業種
- newsLayout:
  - "card"：消息量多、視覺豐富的業種
  - "list"：簡潔專業的業種

其他規則：
- articles 生成 4-6 篇，包含「關於我們」「服務項目」「為什麼選擇我們」等，視業種調整
- news 生成 4 則最新消息
- marquee 生成 5 則滾動文字
- 顏色符合 WCAG AA 對比度
- 可用字型：Inter, Noto Sans TC, Plus Jakarta Sans, DM Sans, Outfit, Manrope, Space Grotesk, Noto Serif TC, Playfair Display, Lora
- 所有文字使用繁體中文，貼近台灣用語習慣`;

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .slice(0, 60) || `article-${Date.now()}`;
}

export async function POST(req: NextRequest, { params }: { params: { siteId: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: site } = await supabase
    .from('sites')
    .select('id, name, module_config, owner_id, seo_config')
    .eq('id', params.siteId)
    .eq('owner_id', user.id)
    .single();
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const { mode, prompt, generated: passedGenerated } = body;

  // ── MODE: apply ── save previously generated data to DB
  if (mode === 'apply') {
    if (!passedGenerated) return NextResponse.json({ error: 'generated data required' }, { status: 400 });
    await applyGenerated(site, params.siteId, passedGenerated, prompt ?? '');
    return NextResponse.json({
      ok: true,
      summary: {
        articles: passedGenerated.articles?.length ?? 0,
        news: passedGenerated.news?.length ?? 0,
        marquee: passedGenerated.marquee?.length ?? 0,
      },
    });
  }

  // ── MODE: preview (default) ── call AI, return data without saving
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

  const client = new Anthropic();
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `網站名稱：${site.name}\n\n描述：${prompt}` }],
  });

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '';
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  let generated: any;
  try {
    generated = JSON.parse(text);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try { generated = JSON.parse(match[0]); } catch { /* fall through */ }
    }
    if (!generated) {
      console.error('[generate-all] parse failed, raw:', raw.slice(0, 500));
      return NextResponse.json({ error: 'AI 回傳格式錯誤，請再試一次' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, preview: generated });
}

async function applyGenerated(site: any, siteId: string, generated: any, prompt: string) {
  const service = createServiceClient();

  // 1. Save theme
  const themeConfig = { ...generated.theme, ai_prompt: prompt };
  await service.from('sites').update({ theme_config: themeConfig }).eq('id', siteId);

  // 2. Update module_config
  const layoutConfig = generated.layout ?? {};
  const moduleUpdate = {
    ...site.module_config,
    hero: {
      ...(site.module_config as any).hero,
      enabled: true,
      type: 'gradient',
      layout: layoutConfig.heroLayout ?? 'centered',
      title: generated.hero?.title ?? '',
      subtitle: generated.hero?.subtitle ?? '',
      ctaText: generated.hero?.ctaText ?? '',
      ctaUrl: generated.hero?.ctaUrl ?? '/contact',
      overlay: false,
    },
    articles: {
      ...(site.module_config as any).articles,
      enabled: true,
      layout: layoutConfig.articlesLayout ?? 'grid',
    },
    news: {
      ...(site.module_config as any).news,
      enabled: true,
      layout: layoutConfig.newsLayout ?? 'list',
    },
    marquee: { ...(site.module_config as any).marquee, enabled: true, items: generated.marquee ?? [] },
  };
  await service.from('sites').update({ module_config: moduleUpdate }).eq('id', siteId);

  // 3. Articles
  await service.from('articles').delete().eq('site_id', siteId);
  if (generated.articles?.length) {
    await service.from('articles').insert(
      generated.articles.map((a: any, i: number) => ({
        site_id: siteId,
        title: a.title,
        slug: toSlug(a.slug || a.title),
        category: a.category ?? null,
        excerpt: a.excerpt ?? null,
        content: a.content ?? '',
        status: 'published',
        published_at: new Date().toISOString(),
        sort_order: i,
      }))
    );
  }

  // 4. News
  await service.from('news').delete().eq('site_id', siteId);
  if (generated.news?.length) {
    await service.from('news').insert(
      generated.news.map((n: any, i: number) => ({
        site_id: siteId,
        title: n.title,
        content: n.content ?? null,
        status: 'published',
        published_at: new Date(Date.now() - i * 86400000).toISOString(),
        sort_order: i,
      }))
    );
  }

  // 5. Marquee
  await service.from('marquee_items').delete().eq('site_id', siteId);
  if (generated.marquee?.length) {
    await service.from('marquee_items').insert(
      generated.marquee.map((text: string, i: number) => ({
        site_id: siteId, text, is_active: true, sort_order: i,
      }))
    );
  }

  // Trigger revalidation
  const siteUrl = (site.seo_config as any)?.vercel_url;
  if (siteUrl && process.env.REVALIDATION_SECRET) {
    try {
      await fetch(`${siteUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-revalidation-secret': process.env.REVALIDATION_SECRET },
        body: JSON.stringify({ paths: ['/', '/articles', '/news'] }),
      });
    } catch { /* non-fatal */ }
  }
}
