import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `你是一個頂尖的網站視覺設計師，熟悉台灣各行業的品牌美學。根據業種與描述，生成精緻、專業的繁體中文網站內容與設計配置。

設計哲學（非常重要）：
- 背景以白色 (#ffffff) 或極淺灰 (#f8fafc / #f4f6f8) 為主，絕不用鮮豔顏色當背景
- primary 顏色用於標題、按鈕、強調線，不做大面積背景
- 字型只用兩種：heading 字型 + body 固定用 Noto Sans TC
- 大量留白：section padding 充裕、行距 1.7、卡片 padding 充足
- 卡片用極淺陰影 + 細邊框，hover 時加深陰影
- 顏色深沉克制，避免糖果色、霓虹色

配色方案（依業種精確選擇）：
- 律師 / 法律 / 公證：primary: #1a2f4a（深海軍藍）, accent: #b8973a（金色）, background: #ffffff, surface: #f7f8fa
- 醫療 / 診所 / 健康：primary: #1d4e6b（深藍綠）, accent: #2a9d8f（青綠）, background: #ffffff, surface: #f0f7f9
- 財務 / 會計 / 顧問：primary: #1e3a2f（深墨綠）, accent: #4a7c6f（中綠）, background: #ffffff, surface: #f4f7f5
- 科技 / 軟體 / 新創：primary: #1e1b4b（深靛紫）, accent: #4f46e5（亮靛）, background: #ffffff, surface: #f8f7ff
- 設計 / 創意 / 攝影：primary: #111111（近黑）, accent: #e63946（紅）, background: #ffffff, surface: #f9f9f9
- 餐飲 / 咖啡 / 食品：primary: #3d1f0d（深咖啡）, accent: #c9722a（橙棕）, background: #fefcf8, surface: #f5f0e8
- 不動產 / 建築：primary: #2c3e50（深藍灰）, accent: #c0922a（金）, background: #ffffff, surface: #f5f6f7
- 教育 / 補習班：primary: #1a3a5c（深藍）, accent: #e67e22（橙）, background: #ffffff, surface: #faf7f2
- 零售 / 電商：primary: #212121（近黑）, accent: #e91e63（粉紅）, background: #ffffff, surface: #fafafa
- 其他一般服務：primary: #1f2d3d（深藍灰）, accent: #3498db（藍）, background: #ffffff, surface: #f4f7fb

字型配對規則（選最符合業種的一組）：
- 律師 / 醫療 / 財務 / 顧問：headingFont: "Manrope", bodyFont: "Noto Sans TC"
- 科技 / 新創 / SaaS：headingFont: "Plus Jakarta Sans", bodyFont: "Noto Sans TC"
- 設計 / 創意 / 個人品牌：headingFont: "Space Grotesk", bodyFont: "Noto Sans TC"
- 餐飲 / 文化 / 傳統：headingFont: "Noto Serif TC", bodyFont: "Noto Sans TC"
- 教育 / 補習 / 一般：headingFont: "Inter", bodyFont: "Noto Sans TC"

版型選擇規則：
- heroLayout:
  - "minimal"：律師、醫療、顧問、財務、設計、科技、個人品牌 → 留白大字，高端感
  - "split"：不動產、建築、企業服務 → 左文右色塊，商務感
  - "centered"：餐飲、零售、活動、一般消費品 → 漸層底色，親和力
- articlesLayout:
  - "magazine"：律師、診所、顧問、不動產（需突出第一篇「關於我們」）
  - "grid"：科技、零售、教育、服務項目多的業種
  - "list"：部落格、新聞、閱讀導向
- newsLayout:
  - "card"：零售、餐飲、消息量多
  - "list"：律師、醫療、顧問等專業服務

內容規則（Landing Page 轉換導向，非傳統企業文章）：
- hero title：直接說出最大利益或解決的核心問題，10 字以內，有衝擊力（例：「讓企業稅務不再是負擔」「3 個月讓業績翻倍」）
- hero subtitle：對目標客戶說話，25 字左右，點出痛點或承諾（例：「我們服務超過 200 家中小企業，幫助他們節省 30% 營運成本」）
- articles 生成 5-6 篇，採 Landing Page 敘事順序：
  1. 痛點共鳴篇：標題如「你是否也面臨這些困境？」，用 <ul> 列出 5-6 個目標客戶的真實痛點，語氣有同理心，結尾引出解決方向
  2. 解決方案篇：標題如「[業種] 的完整解決方案」，說明服務流程與方法，用 <h3> 分步驟，強調「我們不只是…，而是…」
  3. 核心優勢篇：標題如「選擇我們的 3 個理由」或「我們與一般[業種]的差異」，每個優勢用 <h3> 標題 + 2-3 句說明，強調具體數字或成果
  4. 客戶案例篇：標題如「真實客戶的改變」，虛構 2-3 個符合台灣情境的案例（含客戶背景、遭遇問題、合作後成果），成果要具體（「節省 40% 時間」「業績成長 2 倍」）
  5. FAQ 篇：標題如「常見問題解答」，5-6 個真實客戶最常問的問題，每題詳細解答，消除疑慮
  6.（選填）品牌故事篇：標題如「我們為什麼做這件事」，創辦人或團隊的使命感與專業背景，建立信任
  - 每篇 content 至少 400 字，善用 <h2><h3><p><ul><strong> 排版，文字有感染力，避免空洞的企業八股話
- news 生成 4 則，內容建立可信度（例：「獲得 XX 認證」「服務突破 100 家客戶」「媒體報導」「限時優惠活動」）
- marquee 生成 5 則社會證明或優勢宣傳（例：「✓ 服務超過 200 家企業」「★ 客戶滿意度 98%」「免費諮詢 30 分鐘」）
- 所有文字繁體中文，貼近台灣用語，語氣親切有力，不用官腔

重要：只輸出 JSON 物件，第一個字元是 {，最後一個字元是 }，不要有任何其他輸出。

{
  "layout": {
    "heroLayout": "<centered|split|minimal>",
    "articlesLayout": "<grid|list|magazine>",
    "newsLayout": "<list|card>"
  },
  "theme": {
    "colors": {
      "primary": "<深沉主色>",
      "accent": "<點綴色>",
      "background": "#ffffff 或極淺色",
      "surface": "<比 background 稍深，用於卡片底色>",
      "text": "#1a1a1a",
      "textSecondary": "#64748b",
      "border": "#e2e8f0"
    },
    "typography": {
      "headingFont": "<依業種選擇>",
      "bodyFont": "Noto Sans TC",
      "baseFontSize": "16px",
      "headingWeight": "700",
      "lineHeight": "1.7"
    },
    "layout": {
      "maxWidth": "1200px",
      "borderRadius": "<0px|6px|12px>",
      "spacing": "1.5rem",
      "headerStyle": "fixed"
    }
  },
  "hero": {
    "title": "<10 字以內，有力>",
    "subtitle": "<25 字左右，核心價值>",
    "ctaText": "<5 字以內>",
    "ctaUrl": "/contact"
  },
  "articles": [
    {
      "title": "<文章標題>",
      "slug": "<英文slug>",
      "category": "<分類>",
      "excerpt": "<100字以內>",
      "content": "<完整HTML，至少300字>"
    }
  ],
  "news": [
    { "title": "<消息標題>", "content": "<50-100字>" }
  ],
  "marquee": ["<文字1>", "<文字2>", "<文字3>", "<文字4>", "<文字5>"]
}`;

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
