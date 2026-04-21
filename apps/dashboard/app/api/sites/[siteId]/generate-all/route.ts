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

## 版面尺度（依業種氣質選擇，務必跟著這張表走，不要全部都用同一組）
每個業種都有自己的版面節奏，要有明顯差異：

- 律師 / 法律：**editorial 窄版編輯感** — maxWidth: "1040px", spacing: "2rem", lineHeight: "1.8", baseFontSize: "17px", headingWeight: "600", borderRadius: "4px"
- 醫療 / 診所：**clean minimal 乾淨留白** — maxWidth: "1120px", spacing: "1.75rem", lineHeight: "1.7", baseFontSize: "16px", headingWeight: "700", borderRadius: "8px"
- 財務 / 會計 / 顧問：**corporate sober 穩重** — maxWidth: "1120px", spacing: "1.75rem", lineHeight: "1.7", baseFontSize: "16px", headingWeight: "700", borderRadius: "4px"
- 科技 / 軟體 / 新創：**bold modern 俐落現代** — maxWidth: "1200px", spacing: "1.5rem", lineHeight: "1.6", baseFontSize: "16px", headingWeight: "800", borderRadius: "12px"
- 設計 / 創意 / 品牌：**editorial bold 雜誌感** — maxWidth: "1080px", spacing: "2rem", lineHeight: "1.7", baseFontSize: "17px", headingWeight: "700", borderRadius: "0px"
- 餐飲 / 咖啡 / 文化：**warm editorial 溫暖編輯** — maxWidth: "1040px", spacing: "1.75rem", lineHeight: "1.75", baseFontSize: "17px", headingWeight: "600", borderRadius: "6px"
- 不動產 / 建築：**corporate spacious 企業大氣** — maxWidth: "1200px", spacing: "2rem", lineHeight: "1.7", baseFontSize: "16px", headingWeight: "700", borderRadius: "4px"
- 教育 / 補習：**friendly readable 親切易讀** — maxWidth: "1120px", spacing: "1.5rem", lineHeight: "1.8", baseFontSize: "17px", headingWeight: "700", borderRadius: "12px"
- 零售 / 電商 / 美妝：**energetic compact 動感緊湊** — maxWidth: "1280px", spacing: "1.25rem", lineHeight: "1.6", baseFontSize: "16px", headingWeight: "800", borderRadius: "8px"
- 其他服務：**balanced default 平衡** — maxWidth: "1120px", spacing: "1.5rem", lineHeight: "1.7", baseFontSize: "16px", headingWeight: "700", borderRadius: "8px"

盲選一個落在以上 ±5% 誤差內的組合，不能全部站都長一樣。若描述介於兩者之間，挑比較接近的那一組。

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

## 靜態頁面系統（除首頁外，另生多個靜態頁讓 demo 看起來像完整網站）

### 13 種可用區塊（sections 只能用這些類型，不可自創）
- hero: {eyebrow?, title, subtitle?, ctaText?, ctaUrl?, align?:"left"|"center", backgroundUrl?}
- text: {eyebrow?, heading?, body(HTML), align?:"left"|"center", narrow?:bool}
- features_grid: {eyebrow?, heading?, intro?, items:[{title, description, icon?}], columns?:2|3|4}
- cta: {title, description?, buttonText, buttonUrl}
- contact_form: {eyebrow?, heading?, intro?, fields?:["name","email","phone","company","message"], submitText?, successMessage?}
- team_grid: {eyebrow?, heading?, intro?, members:[{name, title, bio?, photoUrl?}], columns?:2|3|4}
- faq: {eyebrow?, heading?, intro?, items:[{question, answer(HTML)}]}
- gallery: {eyebrow?, heading?, intro?, images:[{url, alt?, caption?}], columns?:2|3|4}
- cases_grid: {eyebrow?, heading?, intro?, items:[{title, client?, description, results?, tags?:[], imageUrl?}], columns?:2|3}
- stats: {eyebrow?, heading?, items:[{value, label, suffix?}]}
- testimonials: {eyebrow?, heading?, intro?, items:[{quote, author, role?, company?}], columns?:1|2|3}
- two_column: {eyebrow?, heading?, body(HTML), imageUrl?, imagePosition?:"left"|"right", ctaText?, ctaUrl?}
- process_steps: {eyebrow?, heading?, intro?, items:[{title, description}]}

### 業種對應的標配頁面（每站至少 3 頁靜態頁）
- 律師 / 醫療 / 顧問 / 會計 / 財務：about / services / contact
- 科技 / 軟體 / 新創：about / features / cases / contact
- 設計 / 創意 / 品牌：about / portfolio / contact
- 餐飲 / 咖啡 / 文化：about / menu / contact
- 不動產 / 建築：about / projects / contact
- 教育 / 補習：about / courses / contact
- 零售 / 電商 / 美妝：about / collections / contact
- 其他服務：about / services / contact

slug 用英文小寫，title 用繁中名稱（「關於我們」「服務項目」「作品集」「聯絡我們」「菜單」「課程」…）

### 每頁建議區塊組合（至少 4 個區塊，看起來豐富完整）
- about：hero + stats + text + two_column + team_grid + features_grid + testimonials + faq + cta（8-9 個，最豐富）
- services：hero + process_steps + features_grid + cases_grid + cta（5 個）
- contact：hero + contact_form（2 個，重點在表單，fields 依業種挑需要的）
- portfolio / menu / collections / projects（圖片重）：hero + gallery + cases_grid + cta
- features / cases / courses（資訊重）：hero + features_grid + process_steps + cases_grid + testimonials + cta

### 內容品質要求（填滿、具體、可信，不要留空欄位）
- team_grid：3-6 位成員。名字用台灣常見姓氏（陳林張王李黃吳周劉蔡楊許鄭謝洪郭曾高...），職稱具體（主持律師 / 合夥律師 / 資深會計師 / 產品設計總監 / 主廚 / 執行長），bio 40-60 字寫專長與背景。不要 photoUrl。
- cases_grid：3-6 個案例。client 用產業類別（「TECH 產業」「金融業」「連鎖餐飲」「上市公司」「跨國集團」），不要編真實公司名。description 60-90 字寫挑戰與解方。results 一句話有具體數字（「三週完成」「節省 40% 成本」「勝訴率 92%」「月來客 +65%」）。tags 給 2-3 個業種/服務類別。imageUrl 用 Unsplash 連結（https://images.unsplash.com/photo-xxxxx?w=1200&q=80）找對應業種圖片。
- testimonials：3 個。author 用「王先生 / 李總 / A 小姐 / 林醫師 / 張主任」，quote 80-120 字寫真實情境與感受。
- faq：5-7 題客戶會問的（費用怎算、流程多久、保密嗎、外縣市接嗎、失敗怎辦、第一次要準備什麼、多久可見效…）。answer 用 HTML，可用 <p><ul><strong>。
- stats：3-4 個。value 具體數字，suffix 用 "+" 或 "%" 或業種單位（"年"、"億"、"家"），label 對應（"年實務經驗"、"服務客戶"、"勝訴率"、"追回金額"）。
- gallery：6 張圖。images 用 Unsplash（https://images.unsplash.com/photo-xxxxx?w=800&q=80），找業種對應風格（律師→辦公/會議空間、餐廳→食物/空間、設計→作品/工作室、零售→商品展示）。每張給 caption。
- two_column：body 用 <p> 段落，imageUrl 用 Unsplash 找對應情境。imagePosition 交替使用讓版面不單調。
- process_steps：3-5 步，步驟清楚簡潔。
- hero（頁面用）：title 8-15 字點出該頁主題，subtitle 30-50 字說明這頁能幫客戶什麼。
- eyebrow 一律用英文全大寫（ABOUT US / OUR TEAM / CLIENT VOICES / BY THE NUMBERS / GET IN TOUCH...），heading 用繁體中文。

### 超出靜態網站範圍的需求（列進 outOfScopeRequests，但繼續生其他部分，不要拒絕）
若客戶描述提到以下需求，條列出來提醒這些屬於動態功能需獨立專案：
- 商品購物車、金流、線上購買 → "商品與金流系統"
- 會員登入、註冊、個人中心 → "會員系統"
- 線上預約、日曆、時段選擇 → "預約系統"
- 訂單查詢、物流追蹤 → "訂單系統"
- 留言板、評論、論壇 → "社群互動"
- 多語系切換 → "國際化 i18n"
- 後台資料報表、分析 → "後台儀表板"

所有文字繁體中文，貼近台灣用語，語氣親切有力，不用官腔。

重要：只輸出 JSON 物件，第一個字元是 {，最後一個字元是 }，不要有任何其他輸出。

{
  "layout": { "heroLayout": "<centered|split|minimal>", "articlesLayout": "<magazine|grid|list>", "newsLayout": "<list|card>" },
  "articlesEnabled": true,
  "theme": {
    "colors": { "primary": "<色碼>", "accent": "<色碼>", "background": "#ffffff", "surface": "<色碼>", "text": "#1a1a1a", "textSecondary": "#64748b", "border": "#e2e8f0" },
    "typography": { "headingFont": "<字型>", "bodyFont": "Noto Sans TC", "baseFontSize": "<依業種選 16px|17px>", "headingWeight": "<依業種選 600|700|800>", "lineHeight": "<依業種選 1.6|1.7|1.75|1.8>" },
    "layout": { "maxWidth": "<依業種選 1040px|1080px|1120px|1200px|1280px>", "borderRadius": "<依業種選 0px|4px|6px|8px|12px>", "spacing": "<依業種選 1.25rem|1.5rem|1.75rem|2rem>", "headerStyle": "fixed" }
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
  "marquee": ["<文字1>", "<文字2>", "<文字3>", "<文字4>", "<文字5>"],
  "pages": [
    {
      "slug": "<英文小寫 slug>",
      "title": "<繁中頁面標題>",
      "nav_label": "<顯示在 nav 的文字，通常同 title>",
      "seo": { "title": "<SEO title>", "description": "<SEO description 100-150 字>" },
      "sections": [ { "type": "<區塊類型>", "config": { /* 依該類型 schema */ } } ]
    }
  ],
  "outOfScopeRequests": []
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
        pages: passedGenerated.pages?.length ?? 0,
      },
    });
  }

  // ── MODE: preview (default) ── call AI, return data without saving
  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 });

  const client = new Anthropic();
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 32000,
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

  // 6. Static pages (dynamic pages system)
  await service.from('pages').delete().eq('site_id', siteId);
  if (generated.pages?.length) {
    await service.from('pages').insert(
      generated.pages.map((p: any, i: number) => ({
        site_id: siteId,
        slug: toSlug(p.slug),
        title: p.title ?? p.slug,
        nav_label: p.nav_label ?? p.title ?? null,
        seo: p.seo ?? {},
        sections: Array.isArray(p.sections) ? p.sections : [],
        sort_order: i,
        is_published: true,
        show_in_nav: true,
      }))
    );
  }

  // Trigger revalidation (home + fixed feature routes + each new static page)
  const siteUrl = (site.seo_config as any)?.vercel_url;
  if (siteUrl && process.env.REVALIDATION_SECRET) {
    const pagePaths = (generated.pages ?? []).map((p: any) => `/${toSlug(p.slug)}`);
    try {
      await fetch(`${siteUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-revalidation-secret': process.env.REVALIDATION_SECRET },
        body: JSON.stringify({ paths: ['/', '/articles', '/news', ...pagePaths] }),
      });
    } catch { /* non-fatal */ }
  }
}
