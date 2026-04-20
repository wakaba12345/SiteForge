# SiteForge — Build Progress

> Last updated: 2026-04-20 (session 2)

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
- **AI**: Claude claude-sonnet-4-6 (生成) + claude-haiku-4-5 (訪談)
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
| **Hero** | 三種版型：centered / split / minimal，支援背景圖（next/image） |
| **FeaturesSection** | 差異化優勢卡片（01/02/03 編號），「為什麼選擇我們」，不跳頁 |
| **ProcessSection** | 服務流程步驟（01→02→03→04），漸層圓形編號，消除合作疑慮 |
| **CtaSection** | 底部最終轉換區，primary 色全寬背景 + accent 按鈕，最後推一把 |
| **NewsFeed** | 最新消息（客戶自填），list / card 版型 |
| **ArticleGrid** | 文章列表，magazine / grid / list 版型 |
| **ContactForm** | 聯絡表單，存 DB（不發 email，刻意設計） |
| **Footer** | 多欄連結 + 社群連結 + 版權 |
| **SocialLinks** | LINE/Facebook/Email 浮動按鈕 |

#### ThemeProvider
- 所有模組用 CSS Custom Properties（`--color-primary` 等），不寫死顏色
- Server Component 直接注入 `<style>:root{...}</style>`，無 hydration 問題
- Google Fonts 依主題動態載入，preconnect 預熱

#### SEO
- [x] 全站 `generateMetadata`（title, description, OG image）
- [x] 每篇文章獨立 `generateMetadata`（seo_title, seo_description, cover OG）
- [x] `/sitemap.xml`（自動列出首頁 + 所有已發布文章）
- [x] `/robots.txt`（指向 sitemap，domain-aware）

#### 效能優化
- [x] `next/image` fill + priority + sizes（LCP 優化）
- [x] Google Fonts preconnect links
- [x] Inline style fallbacks for critical layout（gap, overflow, minHeight, display）

#### 文章頁面
- [x] Markdown 和 HTML 雙格式支援
- [x] 自訂 `.prose` CSS（不依賴 @tailwindcss/typography）使用 CSS vars

### ✅ Dashboard 管理後台 (apps/dashboard)

#### 站台管理
- [x] 建立站台（name, slug, domain）
- [x] 模組開關（每個模組可獨立啟用）
- [x] 主題設定（primary/accent/bg/surface/text 顏色 + 字型 + layout 參數）
- [x] Hero 背景圖上傳設定
- [x] SEO 設定（title, description, OG image, favicon, language）
- [x] Vercel 部署按鈕 + vercel_url 設定
- [x] 網站預覽 iframe（即時看線上成果）

#### AI 一鍵建站（generate page）
- [x] **兩步驟流程**：AI 預覽 → 確認套用（避免誤操作）
- [x] **視覺預覽**：桌機/平板/手機三格同時顯示（CSS scale）
- [x] 套用成功後立即顯示「查看線上網站」大按鈕 + live iframe
- [x] AI 自動選配色（10 種業種色票）、字型配對（5 組）、版型
- [x] Landing page 敘事結構：痛點 → 優勢 → 特色 → FAQ → 品牌故事
- [x] Features 和 Articles 分開（Features = 自包含卡片，Articles = 知識庫）
- [x] 跑馬燈預設為新聞稿格式（受獎/受邀演講/媒體曝光）
- [x] 文章可依需求決定是否生成（`articlesEnabled`）
- [x] 部署說明：清楚區分「套用內容（不需部署）」vs「改程式碼（需部署）」

#### AI 訪談建站（interview chat）
- [x] Haiku 模型，逐一問 8-9 個問題
- [x] 自動偵測 `[READY_TO_BUILD]` marker 切換到生成流程
- [x] 訪談包含：業種、服務、客群、風格、顏色、優勢、**是否需要文章系統**、特殊需求

### ✅ 客戶站管理後台 (apps/site/app/admin)

JapanLive 風格深色海軍藍 UI，每個客戶站都有獨立的 `/admin`：

- [x] 登入（ADMIN_PASSWORD 環境變數，HMAC cookie）
- [x] 文章管理（CRUD + 發布/草稿）
- [x] 最新消息管理
- [x] 跑馬燈管理
- [x] AI 輔助功能：標題建議、SEO 最佳化、文章潤稿、標題角度分析

---

## 重要設計決策

| 決策 | 原因 |
|------|------|
| 聯絡表單不發 email | 保持簡單，存 DB 即可，避免 Resend/SMTP 複雜度 |
| CSS Custom Properties | 所有模組共用一套 var，換主題只需改 :root，無需改元件 |
| Features 獨立於 Articles | Articles = 知識庫（要跳頁閱讀），Features = 差異化卡片（自包含，不跳頁） |
| JapanLive 轉換漏斗為 default | 模組順序：Hero → 差異化 → 流程 → 知識庫 → 消息 → 最終CTA → 表單，參考 japanlive.info 電商轉換邏輯 |
| 最新消息手動填寫 | 客戶自行公告，非 RSS 自動抓，不需 cronjob |
| No @tailwindcss/typography | 用自訂 .prose CSS（使用 CSS vars），避免插件依賴 |
| Inline style fallbacks | 關鍵 layout 屬性（gap, overflow, minHeight）加 inline style，防 Tailwind purge 問題 |

---

## 已知問題 / 待辦

- [x] **文章分類標籤篩選**：`/articles` 頁加入 category 篩選 pills，純 Server Component + URL searchParams，點選即篩選，選中狀態用 primary 色高亮
- [x] **Hero 背景圖直接上傳**：settings 頁加入「上傳圖片」按鈕，呼叫既有 `/api/media` 上傳至 Supabase Storage，自動填回 URL 欄位
- [x] **聯絡表單可見性**：SiteNav 加入「聯絡表單」連結 + 未讀數量 badge；contacts 頁面加入「全部標記已讀」Server Action 按鈕；layout 並行查詢未讀數（不增加額外延遲）
- [ ] RSS 自動抓新聞功能（討論中，尚未實作）
- [ ] 多語系支援（目前預設繁體中文）

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

**套用內容** → 不需重新部署（ISR revalidation 自動更新）  
**改程式碼** → 需在 Vercel 重新部署
