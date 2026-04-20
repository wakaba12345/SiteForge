# SiteForge — Build Progress

> Last updated: 2026-04-20 (session 3)

---

## 專案概覽

**SiteForge** 是一個「一套程式碼、多個客戶網站」的白標網站平台。  
一個 Dashboard 管理所有客戶站，每個客戶站跑同一套 Core Engine，只靠 Supabase 的 config row 區分。

### Monorepo 結構
```
siteforge/
├── apps/
│   ├── dashboard/     ← 管理後台 (port 3001)
│   └── site/          ← 客戶網站 Core Engine (Vercel per-site)
├── packages/
│   ├── types/         ← 共用 TypeScript interfaces
│   └── db/            ← Supabase client + query functions
```

### Tech Stack
- **框架**: Next.js 14 App Router + TypeScript 5
- **DB/Auth/Storage**: Supabase (PostgreSQL)
- **樣式**: Tailwind CSS + CSS Custom Properties (ThemeProvider)
- **AI**: Claude claude-sonnet-4-6 (生成，16k tokens) + claude-haiku-4-5 (訪談)
- **部署**: Vercel (每個客戶站獨立部署)
- **Monorepo**: Turborepo + pnpm 8

---

## 完成功能清單

### ✅ 基礎架構
- [x] Turborepo monorepo 設定，packages 共用
- [x] Supabase schema：sites、articles、news、marquee_items、contact_submissions、media
- [x] 多站點路由：domain 優先 → 環境變數 `SITE_SLUG` fallback
- [x] `React.cache()` dedup Supabase calls（generateMetadata + RootLayout）
- [x] ISR `revalidate = 3600` + 手動 revalidation API

### ✅ 客戶網站 Core Engine (apps/site)

#### 模組系統（全部可開關）
| 模組 | 說明 |
|------|------|
| **Marquee** | 跑馬燈公告，CSS animation，overflow 正確 clip |
| **HeroNewsSection** | Hero 左側 + 最新消息右側（JapanLive 版面），日期/標題列表/分隔線；mobile 自動堆疊 |
| **Hero** | 獨立版本（未搭配 News 時）：centered / split / minimal，支援背景圖 |
| **FeaturesSection** | 差異化優勢卡片（01/02/03 編號），「為什麼選擇我們」，不跳頁 |
| **ProcessSection** | 服務流程步驟（01→02→03→04），漸層圓形編號，消除合作疑慮 |
| **NewsFeed** | 獨立版本（未搭配 Hero 時）：list / card 版型 |
| **ArticleGrid** | 文章列表，magazine / grid / list 版型；`/articles` 頁支援 category 篩選 pills |
| **CtaSection** | 底部最終轉換區，primary 色全寬背景 + accent 按鈕，最後推一把 |
| **ContactForm** | 聯絡表單，存 DB（不發 email，刻意設計） |
| **Footer** | 多欄連結 + 社群連結 + 版權 |
| **SocialLinks** | LINE/Facebook/Email 浮動按鈕 |

#### 模組渲染邏輯（JapanLive 轉換漏斗順序）
```
跑馬燈 → HeroNewsSection（Hero 左 + 消息右）→ 差異化優勢 → 服務流程
→ 文章知識庫 → 最終CTA → 聯絡表單 → Footer
```
- Hero + News **同時啟用** → `HeroNewsSection`（合併版）
- 只啟用其中一個 → 各自獨立渲染

#### ThemeProvider
- 所有模組用 CSS Custom Properties（`--color-primary` 等），不寫死顏色
- Server Component 直接注入 `<style>:root{...}</style>`，無 hydration 問題
- Google Fonts 依主題動態載入，preconnect 預熱

#### SEO
- [x] 全站 `generateMetadata`（title, description, OG image）
- [x] 每篇文章獨立 `generateMetadata`（seo_title, seo_description, cover OG）
- [x] `/sitemap.xml`（自動列出首頁 + 所有已發布文章）
- [x] `/robots.txt`（指向 sitemap，domain-aware）

#### 文章頁面
- [x] Markdown 和 HTML 雙格式支援
- [x] 自訂 `.prose` CSS（不依賴 @tailwindcss/typography）使用 CSS vars
- [x] `/articles` 頁支援 `?category=X` 篩選，Server Component + URL searchParams

### ✅ Dashboard 管理後台 (apps/dashboard)

#### 站台管理
- [x] 建立站台（name, slug, domain）
- [x] 模組開關（features / process / cta 也有獨立開關）
- [x] 主題設定（primary/accent/bg/surface/text 顏色 + 字型 + layout 參數）
- [x] Hero 背景圖：URL 輸入 + 「上傳圖片」按鈕（呼叫 `/api/media`，存 Supabase Storage，自動填回 URL）
- [x] SEO 設定（title, description, OG image, favicon, language）
- [x] Vercel 部署按鈕（顯示「永久站台網址」，明確標示不需重新部署）

#### AI 一鍵建站（generate page）
- [x] **兩步驟流程**：AI 預覽 → 確認套用（避免誤操作）
- [x] **視覺預覽**：桌機/平板/手機三格同時顯示（CSS scale miniature）
- [x] **套用後 iframe**：內嵌 live 網站 + 🖥/⬜/📱 三裝置切換（取代已移除的獨立預覽頁）
- [x] AI 生成完整轉換漏斗內容：hero / features（差異化）/ process（合作流程）/ articles（知識庫）/ news（社會信任）/ cta（最終轉換）/ marquee
- [x] max_tokens 16000（防止長 JSON 截斷）
- [x] 部署說明重寫：永久網址 / 套用內容不需重新部署 / ISR 1-2 分鐘生效

#### AI 訪談建站（interview chat）
- [x] Haiku 模型，逐一問 8-9 個問題
- [x] 自動偵測 `[READY_TO_BUILD]` marker 切換到生成流程
- [x] 訪談包含：業種、服務、客群、風格、顏色、優勢、是否需要文章系統、特殊需求

#### 聯絡表單管理
- [x] SiteNav 加入「聯絡表單」連結 + 未讀數量 badge（layout 並行查詢，不增加 waterfall）
- [x] Contacts 頁面：「全部標記已讀」Server Action 按鈕，revalidatePath 即時更新 badge

### ✅ 客戶站管理後台 (apps/site/app/admin)

JapanLive 風格深色海軍藍 UI，每個客戶站都有獨立的 `/admin`：

- [x] 登入（ADMIN_PASSWORD 環境變數，HMAC cookie）
- [x] 文章管理（CRUD + 發布/草稿 + 排程）
- [x] 最新消息管理
- [x] 跑馬燈管理
- [x] **TipTap WYSIWYG 編輯器**（移植自 japanlive-v2）：所見即所得/HTML 雙 tab、H1-H4、B/I/U/S、項目/編號、引用、代碼、連結、圖片（上傳 or 網址）
- [x] **圖片上傳** 存 Supabase Storage，同時支援封面圖、內文圖；`/api/admin/upload` endpoint
- [x] AI 輔助功能：標題建議、SEO 最佳化、文章潤稿（含上下文 context 高亮）、切角分析、第一段建議

---

## 重要設計決策

| 決策 | 原因 |
|------|------|
| 聯絡表單不發 email | 保持簡單，存 DB 即可，避免 Resend/SMTP 複雜度 |
| CSS Custom Properties | 所有模組共用一套 var，換主題只需改 :root，無需改元件 |
| Features 獨立於 Articles | Articles = 知識庫（要跳頁閱讀），Features = 差異化卡片（自包含，不跳頁） |
| JapanLive 轉換漏斗為 default | 參考 japanlive.info 電商轉換邏輯：痛點 → 信任 → 流程 → 知識 → 社會證明 → CTA |
| Hero + News 合併渲染 | 兩個模組同時啟用時自動合併為左右分欄（JapanLive 版面），單獨啟用則各自獨立 |
| 套用內容不需重新部署 | ISR revalidation 自動更新，Vercel URL 永久固定，只有改程式碼才需重部署 |
| 最新消息手動填寫 | 客戶自行公告，非 RSS 自動抓，不需 cronjob |
| No @tailwindcss/typography | 用自訂 .prose CSS（使用 CSS vars），避免插件依賴 |

---

## 待辦 / 未來方向

- [ ] RSS 自動抓新聞功能（討論中）
- [ ] 多語系支援（目前預設繁體中文）
- [x] HeroNewsSection 在 generate 頁的小預覽已更新（Hero 左側 + 最新消息右側，與實際網站一致）

---

## Vercel 部署方式

每個客戶站是獨立的 Vercel 專案，部署 `apps/site`，環境變數：

```
SITE_SLUG=<客戶slug>
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
REVALIDATION_SECRET=...
ADMIN_PASSWORD=...
ADMIN_HMAC_SECRET=...
```

**套用內容（文章/消息/跑馬燈/主題）** → 不需重新部署，ISR 1-2 分鐘自動更新  
**改程式碼（新增模組/修改版面）** → 需在 Vercel 重新部署
