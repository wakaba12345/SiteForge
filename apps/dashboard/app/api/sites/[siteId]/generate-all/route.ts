import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `你是一個專業的網站內容生成助理。根據用戶描述，生成一個完整的繁體中文網站內容，輸出純 JSON，不要有任何 markdown 或說明文字。

輸出格式如下：
{
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

規則：
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
    .select('id, name, module_config, owner_id')
    .eq('id', params.siteId)
    .eq('owner_id', user.id)
    .single();
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { prompt } = await req.json();
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

  const client = new Anthropic();
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `網站名稱：${site.name}\n\n描述：${prompt}` }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
  let generated: any;
  try {
    generated = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'AI 回傳格式錯誤，請再試一次' }, { status: 500 });
  }

  const service = createServiceClient();

  // 1. Save theme
  const themeConfig = { ...generated.theme, ai_prompt: prompt };
  await service.from('sites').update({ theme_config: themeConfig }).eq('id', params.siteId);

  // 2. Update module_config: enable hero, articles, news, marquee
  const moduleUpdate = {
    ...site.module_config,
    hero: {
      ...(site.module_config as any).hero,
      enabled: true,
      type: 'gradient',
      title: generated.hero?.title ?? '',
      subtitle: generated.hero?.subtitle ?? '',
      ctaText: generated.hero?.ctaText ?? '',
      ctaUrl: generated.hero?.ctaUrl ?? '/contact',
      overlay: false,
    },
    articles: { ...(site.module_config as any).articles, enabled: true },
    news: { ...(site.module_config as any).news, enabled: true },
    marquee: { ...(site.module_config as any).marquee, enabled: true, items: generated.marquee ?? [] },
  };
  await service.from('sites').update({ module_config: moduleUpdate }).eq('id', params.siteId);

  // 3. Insert articles (clear existing first)
  await service.from('articles').delete().eq('site_id', params.siteId);
  if (generated.articles?.length) {
    const articles = generated.articles.map((a: any, i: number) => ({
      site_id: params.siteId,
      title: a.title,
      slug: toSlug(a.slug || a.title),
      category: a.category ?? null,
      excerpt: a.excerpt ?? null,
      content: a.content ?? '',
      status: 'published',
      published_at: new Date().toISOString(),
      sort_order: i,
    }));
    await service.from('articles').insert(articles);
  }

  // 4. Insert news (clear existing first)
  await service.from('news').delete().eq('site_id', params.siteId);
  if (generated.news?.length) {
    const news = generated.news.map((n: any, i: number) => ({
      site_id: params.siteId,
      title: n.title,
      content: n.content ?? null,
      status: 'published',
      published_at: new Date(Date.now() - i * 86400000).toISOString(),
      sort_order: i,
    }));
    await service.from('news').insert(news);
  }

  // 5. Insert marquee items (clear existing first)
  await service.from('marquee_items').delete().eq('site_id', params.siteId);
  if (generated.marquee?.length) {
    const items = generated.marquee.map((text: string, i: number) => ({
      site_id: params.siteId,
      text,
      is_active: true,
      sort_order: i,
    }));
    await service.from('marquee_items').insert(items);
  }

  return NextResponse.json({
    ok: true,
    summary: {
      articles: generated.articles?.length ?? 0,
      news: generated.news?.length ?? 0,
      marquee: generated.marquee?.length ?? 0,
    },
  });
}
