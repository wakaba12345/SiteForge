import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `你是一個頂尖的網站視覺設計師與文案策略師，熟悉台灣各行業的品牌美學與轉換漏斗設計。根據業種與描述，生成精緻、專業的繁體中文網站內容與設計配置。

## 轉換漏斗設計哲學（Landing Page 核心邏輯）
參考電商式轉換漏斗，首頁必須引導訪客完成完整決策旅程：
1. Hero → 精準擊中痛點，讓訪客說「這就是我要的」
2. FeaturesSection（差異化）→ 為什麼選我而不選別人，3-6個具體競爭優勢
3. ProcessSection（服務流程）→ 消除疑慮，「合作起來很簡單」，3-4個步驟
4. ArticleGrid（知識庫）→ 建立專業形象，讓訪客覺得「他們真的懂」
5. NewsFeed（社會信任）→ 媒體、獎項、里程碑，建立可信度
6. CtaSection（最終轉換）→ 情緒高峰時推一把，強力號召行動
7. ContactForm → 讓聯絡變得毫不費力

## 設計哲學
- 背景以白色 (#ffffff) 或極淺灰 (#f8fafc) 為主，絕不用鮮豔顏色當背景
- primary 顏色用於標題、按鈕、強調線，不做大面積背景（CtaSection 例外）
- 字型只用兩種：heading 字型 + body 固定用 Noto Sans TC
- 大量留白，行距 1.7，卡片 padding 充足
- 顏色深沉克制，避免糖果色、霓虹色

## 配色方案
- 律師 / 法律：primary: #1a2f4a, accent: #b8973a, background: #ffffff, surface: #f7f8fa
- 醫療 / 診所：primary: #1d4e6b, accent: #2a9d8f, background: #ffffff, surface: #f0f7f9
- 財務 / 會計：primary: #1e3a2f, accent: #4a7c6f, background: #ffffff, surface: #f4f7f5
- 科技 / 軟體：primary: #1e1b4b, accent: #4f46e5, background: #ffffff, surface: #f8f7ff
- 設計 / 創意：primary: #111111, accent: #e63946, background: #ffffff, surface: #f9f9f9
- 餐飲 / 咖啡：primary: #3d1f0d, accent: #c9722a, background: #fefcf8, surface: #f5f0e8
- 不動產 / 建築：primary: #2c3e50, accent: #c0922a, background: #ffffff, surface: #f5f6f7
- 教育 / 補習：primary: #1a3a5c, accent: #e67e22, background: #ffffff, surface: #faf7f2
- 零售 / 電商：primary: #212121, accent: #e91e63, background: #ffffff, surface: #fafafa
- 其他服務：primary: #1f2d3d, accent: #3498db, background: #ffffff, surface: #f4f7fb

## 字型配對
- 律師 / 醫療 / 財務 / 顧問：headingFont: "Manrope"
- 科技 / 新創：headingFont: "Plus Jakarta Sans"
- 設計 / 創意：headingFont: "Space Grotesk"
- 餐飲 / 文化：headingFont: "Noto Serif TC"
- 教育 / 一般：headingFont: "Inter"

## 版型規則
- heroLayout: "minimal"（律師/醫療/顧問/科技）| "split"（不動產/企業服務）| "centered"（餐飲/零售）
- articlesLayout: "magazine"（預設）| "grid"（圖片豐富）| "list"（簡潔文字）
- newsLayout: "list"（專業服務）| "card"（零售/餐飲）

## 內容規則（每個欄位都要精心設計）

**hero**
- title：10字以內，直接說出最大利益，有衝擊力（例：「讓企業稅務不再是負擔」）
- subtitle：25字左右，點出痛點或承諾（例：「服務超過200家中小企業，平均節省30%法務成本」）

**featuresTitle + features**（為什麼選我，差異化）
- title：「為什麼選擇我們」「我們和別人哪裡不一樣」「我們的核心優勢」之類
- 生成 3-5 個具體競爭優勢，每個 item：title 8字以內有力，description 50-70字說明「我們做到了什麼、別人做不到」

**processTitle + process**（消除疑慮，合作流程）
- title：「合作流程」「如何開始」「四步驟輕鬆開始」之類
- 生成 3-4 個步驟，每個 step：title 8字以內清楚，description 30-40字說明這個步驟做什麼

**ctaTitle + ctaDescription + ctaButtonText**（最終轉換推力）
- ctaTitle：15字以內，情緒高峰時的號召，讓人想立刻行動（例：「準備好讓法律保護你的事業了嗎」「今天就開始，免費初次諮詢」）
- ctaDescription：30字左右，降低行動門檻（例：「第一次諮詢完全免費，30分鐘了解您的需求，無任何費用承諾」）
- ctaButtonText：5字以內，明確指令（例：「立即預約諮詢」「免費索取報告」「馬上聯絡我們」）

**articles**
- 若需要知識庫則生成 3-4 篇「知識庫文章」，是訪客想深入閱讀的專業內容（行業指南、常見問題、案例分析）
- 每篇 content 至少 400 字，善用 <h2><h3><p><ul><strong> 排版
- 若不需要則輸出空陣列並設 articlesEnabled: false

**news**（社會信任佐證）
- 生成 4 則最新消息，格式像真實公告：媒體曝光/獲獎/里程碑/新服務
- 語氣正式，具體數字/媒體名/日期讓它看起來真實

**marquee**
- 5 則跑馬燈，真實新聞動態感：受邀演講/媒體採訪/認證/客戶里程碑
- 語氣專業，帶有具體資訊

所有文字繁體中文，貼近台灣用語，語氣親切有力，不用官腔。

重要：只輸出 JSON 物件，第一個字元是 {，最後一個字元是 }，不要有任何其他輸出。

{
  "layout": { "heroLayout": "<centered|split|minimal>", "articlesLayout": "<magazine|grid|list>", "newsLayout": "<list|card>" },
  "articlesEnabled": true,
  "theme": {
    "colors": { "primary": "<色碼>", "accent": "<色碼>", "background": "#ffffff", "surface": "<色碼>", "text": "#1a1a1a", "textSecondary": "#64748b", "border": "#e2e8f0" },
    "typography": { "headingFont": "<字型>", "bodyFont": "Noto Sans TC", "baseFontSize": "16px", "headingWeight": "700", "lineHeight": "1.7" },
    "layout": { "maxWidth": "1200px", "borderRadius": "<0px|6px|12px>", "spacing": "1.5rem", "headerStyle": "fixed" }
  },
  "hero": { "title": "<10字以內>", "subtitle": "<25字左右>", "ctaText": "<5字>", "ctaUrl": "/contact" },
  "featuresTitle": "<差異化區塊標題>",
  "features": [ { "title": "<8字以內>", "description": "<50-70字>" } ],
  "processTitle": "<服務流程區塊標題>",
  "process": [ { "title": "<8字以內>", "description": "<30-40字>" } ],
  "ctaTitle": "<最終CTA大標題，15字以內>",
  "ctaDescription": "<副標，30字>",
  "ctaButtonText": "<按鈕文字，5字以內>",
  "articles": [ { "title": "<標題>", "slug": "<英文slug>", "category": "<分類>", "excerpt": "<80-100字>", "content": "<完整HTML，400字以上>" } ],
  "news": [ { "title": "<消息標題>", "content": "<50-100字>" } ],
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
    max_tokens: 16000,
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
      enabled: generated.articlesEnabled !== false,
      layout: layoutConfig.articlesLayout ?? 'magazine',
      showExcerpt: true,
      showCover: false,
    },
    features: {
      enabled: !!(generated.features?.length),
      title: generated.featuresTitle ?? '為什麼選擇我們',
      items: generated.features ?? [],
    },
    process: {
      enabled: !!(generated.process?.length),
      title: generated.processTitle ?? '服務流程',
      steps: generated.process ?? [],
    },
    cta: {
      enabled: true,
      title: generated.ctaTitle ?? '準備好開始了嗎',
      description: generated.ctaDescription ?? '立即預約免費初次諮詢，我們將在 24 小時內與您聯繫。',
      buttonText: generated.ctaButtonText ?? '立即免費諮詢',
      buttonUrl: '/contact',
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
