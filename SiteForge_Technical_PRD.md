# SiteForge Technical PRD

> **Purpose**: This document is the complete technical specification for building SiteForge — a multi-site management platform. It is written for AI code generation (Claude Code / Sonnet 4.6) and contains all schemas, interfaces, file structures, and implementation details needed to build the system from scratch.

---

## 1. System Overview

SiteForge is a **"one codebase, many instances"** multi-site management system.

**Architecture:**

```
┌─────────────────────────────────────────────────┐
│              SiteForge Dashboard                 │
│         (dashboard.siteforge.app)                │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Site Mgmt │ │ Module   │ │ AI Style         │ │
│  │ CRUD      │ │ Toggle   │ │ Generator        │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└──────────────────┬──────────────────────────────┘
                   │ reads/writes config
                   ▼
          ┌────────────────┐
          │   Supabase DB  │
          │  (shared, with │
          │   site_id FK)  │
          └───────┬────────┘
                  │ config per site
        ┌─────────┼─────────┐
        ▼         ▼         ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ Site A  │ │ Site B  │ │ Site C  │
   │ Engine  │ │ Engine  │ │ Engine  │
   │ +Config │ │ +Config │ │ +Config │
   └─────────┘ └─────────┘ └─────────┘
   a.com       b.com       c.com
   (Vercel)    (Vercel)    (Vercel)
```

**Key principle**: Every site runs the same Core Engine code. The only difference between sites is their `config` row in Supabase (which modules are on/off, what theme to apply, what content to show).

---

## 2. Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| Database | Supabase (PostgreSQL) | latest |
| Auth | Supabase Auth | latest |
| Storage | Supabase Storage | latest |
| Styling | Tailwind CSS + CSS Custom Properties | 3.x |
| Content | MDX (via next-mdx-remote) | latest |
| AI | Claude API (Anthropic) | claude-sonnet-4-20250514 |
| Deployment | Vercel | latest |
| Monorepo | Turborepo | latest |
| Package Manager | pnpm | 8.x |

---

## 3. Monorepo Structure

```
siteforge/
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
│
├── apps/
│   ├── dashboard/                    # Main control panel
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Dashboard home: site list
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── sites/
│   │   │   │   ├── page.tsx          # All sites grid
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create new site wizard
│   │   │   │   └── [siteId]/
│   │   │   │       ├── page.tsx      # Site overview
│   │   │   │       ├── modules/
│   │   │   │       │   └── page.tsx  # Module toggles + config
│   │   │   │       ├── theme/
│   │   │   │       │   └── page.tsx  # AI style generator + manual tweaks
│   │   │   │       ├── content/
│   │   │   │       │   ├── articles/
│   │   │   │       │   │   ├── page.tsx      # Article list
│   │   │   │       │   │   ├── new/
│   │   │   │       │   │   │   └── page.tsx  # Article editor
│   │   │   │       │   │   └── [articleId]/
│   │   │   │       │   │       └── page.tsx  # Edit article
│   │   │   │       │   ├── news/
│   │   │   │       │   │   └── page.tsx      # News CRUD
│   │   │   │       │   └── marquee/
│   │   │   │       │       └── page.tsx      # Marquee items editor
│   │   │   │       ├── settings/
│   │   │   │       │   └── page.tsx  # Domain, SEO, favicon, OG
│   │   │   │       └── preview/
│   │   │   │           └── page.tsx  # Live preview iframe
│   │   │   └── api/
│   │   │       ├── sites/
│   │   │       │   └── route.ts      # CRUD sites
│   │   │       ├── modules/
│   │   │       │   └── route.ts      # Update module config
│   │   │       ├── theme/
│   │   │       │   ├── generate/
│   │   │       │   │   └── route.ts  # AI style generation
│   │   │       │   └── route.ts      # Save theme config
│   │   │       ├── content/
│   │   │       │   ├── articles/
│   │   │       │   │   └── route.ts
│   │   │       │   ├── news/
│   │   │       │   │   └── route.ts
│   │   │       │   └── marquee/
│   │   │       │       └── route.ts
│   │   │       ├── media/
│   │   │       │   └── route.ts      # Upload to Supabase Storage
│   │   │       └── revalidate/
│   │   │           └── route.ts      # Trigger site revalidation
│   │   ├── components/
│   │   │   ├── SiteCard.tsx
│   │   │   ├── ModuleToggleGrid.tsx
│   │   │   ├── ThemeGenerator.tsx
│   │   │   ├── ThemePreview.tsx
│   │   │   ├── ArticleEditor.tsx
│   │   │   ├── NewsManager.tsx
│   │   │   ├── MarqueeEditor.tsx
│   │   │   └── MediaLibrary.tsx
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── site/                         # Core Engine (shared site template)
│       ├── app/
│       │   ├── layout.tsx            # Reads theme_config, injects CSS vars
│       │   ├── page.tsx              # Home: renders enabled modules
│       │   ├── articles/
│       │   │   ├── page.tsx          # Article list
│       │   │   └── [slug]/
│       │   │       └── page.tsx      # Article detail (MDX render)
│       │   ├── news/
│       │   │   └── page.tsx          # News list page
│       │   └── api/
│       │       └── revalidate/
│       │           └── route.ts      # On-demand ISR revalidation endpoint
│       ├── components/
│       │   ├── modules/
│       │   │   ├── Marquee.tsx
│       │   │   ├── NewsFeed.tsx
│       │   │   ├── ArticleGrid.tsx
│       │   │   ├── Hero.tsx
│       │   │   ├── ContactForm.tsx
│       │   │   └── Footer.tsx
│       │   ├── ModuleRenderer.tsx    # Dynamic module loader based on config
│       │   └── ThemeProvider.tsx     # Injects CSS custom properties
│       ├── lib/
│       │   ├── config.ts            # Fetch site config from Supabase by domain/slug
│       │   ├── supabase.ts          # Supabase client
│       │   └── mdx.ts              # MDX processing utilities
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── types/                        # Shared TypeScript types
│   │   ├── index.ts
│   │   └── package.json
│   ├── db/                           # Supabase client + queries
│   │   ├── index.ts
│   │   ├── schema.sql
│   │   ├── queries/
│   │   │   ├── sites.ts
│   │   │   ├── articles.ts
│   │   │   ├── news.ts
│   │   │   └── media.ts
│   │   └── package.json
│   └── ui/                           # Shared UI components (optional)
│       ├── index.ts
│       └── package.json
│
└── .env.example
```

---

## 4. Database Schema (Supabase PostgreSQL)

```sql
-- ============================================
-- SiteForge Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. SITES
-- ============================================
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT,                          -- custom domain (nullable)
  status TEXT NOT NULL DEFAULT 'draft'  -- 'active' | 'paused' | 'draft'
    CHECK (status IN ('active', 'paused', 'draft')),
  
  -- Module configuration (which modules are on/off + their settings)
  module_config JSONB NOT NULL DEFAULT '{
    "marquee": { "enabled": false, "speed": "medium", "items": [] },
    "news": { "enabled": false, "count": 5, "layout": "list", "showDate": true },
    "articles": { "enabled": true, "layout": "grid", "perPage": 12, "showExcerpt": true, "showCover": true },
    "hero": { "enabled": false, "type": "image", "title": "", "subtitle": "", "ctaText": "", "ctaUrl": "", "overlay": true },
    "contact": { "enabled": false, "fields": ["name", "email", "message"], "notifyEmail": "", "successMessage": "送信完了" },
    "footer": { "enabled": true, "columns": 3, "links": [], "showSocial": false, "copyright": "" }
  }'::jsonb,
  
  -- Theme configuration (AI-generated or manually set)
  theme_config JSONB NOT NULL DEFAULT '{
    "colors": {
      "primary": "#1A1A2E",
      "accent": "#E94560",
      "background": "#FFFFFF",
      "surface": "#F9FAFB",
      "text": "#111827",
      "textSecondary": "#6B7280",
      "border": "#E5E7EB"
    },
    "typography": {
      "headingFont": "Noto Sans TC",
      "bodyFont": "Inter",
      "baseFontSize": "16px",
      "headingWeight": "700",
      "lineHeight": "1.6"
    },
    "layout": {
      "maxWidth": "1200px",
      "borderRadius": "8px",
      "spacing": "1.5rem",
      "headerStyle": "fixed"
    },
    "ai_prompt": ""
  }'::jsonb,
  
  -- SEO & metadata
  seo_config JSONB NOT NULL DEFAULT '{
    "title": "",
    "description": "",
    "ogImage": "",
    "favicon": "",
    "language": "zh-TW"
  }'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. ARTICLES
-- ============================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,                -- MDX content
  cover_image TEXT,                     -- URL from Supabase Storage
  
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('published', 'draft', 'scheduled')),
  published_at TIMESTAMPTZ,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(site_id, slug)
);

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_articles_site_id ON articles(site_id);
CREATE INDEX idx_articles_status ON articles(site_id, status, published_at DESC);

-- ============================================
-- 3. NEWS (最新消息)
-- ============================================
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  content TEXT,                         -- Short content or link
  url TEXT,                             -- External link (optional)
  category TEXT,
  
  is_pinned BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'draft')),
  
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_news_site_id ON news(site_id, is_pinned DESC, published_at DESC);

-- ============================================
-- 4. MARQUEE ITEMS (跑馬燈)
-- ============================================
CREATE TABLE marquee_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  text TEXT NOT NULL,
  url TEXT,                             -- Link (optional)
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_marquee_site_id ON marquee_items(site_id, is_active, sort_order);

-- ============================================
-- 5. MEDIA (媒體庫)
-- ============================================
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,           -- Supabase Storage path
  url TEXT NOT NULL,                    -- Public URL
  mime_type TEXT NOT NULL,
  size_bytes INT,
  alt_text TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_site_id ON media(site_id, created_at DESC);

-- ============================================
-- 6. THEME TEMPLATES (風格樣板庫)
-- ============================================
CREATE TABLE theme_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  preview_image TEXT,
  theme_config JSONB NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. CONTACT SUBMISSIONS (聯絡表單提交)
-- ============================================
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  
  data JSONB NOT NULL,                  -- Form field values
  is_read BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_site_id ON contact_submissions(site_id, is_read, created_at DESC);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE marquee_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_templates ENABLE ROW LEVEL SECURITY;

-- Dashboard access: owner can do everything
CREATE POLICY "Owner full access" ON sites
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Owner articles" ON articles
  FOR ALL USING (site_id IN (SELECT id FROM sites WHERE owner_id = auth.uid()));

CREATE POLICY "Owner news" ON news
  FOR ALL USING (site_id IN (SELECT id FROM sites WHERE owner_id = auth.uid()));

CREATE POLICY "Owner marquee" ON marquee_items
  FOR ALL USING (site_id IN (SELECT id FROM sites WHERE owner_id = auth.uid()));

CREATE POLICY "Owner media" ON media
  FOR ALL USING (site_id IN (SELECT id FROM sites WHERE owner_id = auth.uid()));

CREATE POLICY "Owner contacts" ON contact_submissions
  FOR ALL USING (site_id IN (SELECT id FROM sites WHERE owner_id = auth.uid()));

-- Public read for active sites (used by site engine)
CREATE POLICY "Public read active sites" ON sites
  FOR SELECT USING (status = 'active');

CREATE POLICY "Public read published articles" ON articles
  FOR SELECT USING (
    status = 'published' 
    AND site_id IN (SELECT id FROM sites WHERE status = 'active')
  );

CREATE POLICY "Public read published news" ON news
  FOR SELECT USING (
    status = 'published'
    AND site_id IN (SELECT id FROM sites WHERE status = 'active')
  );

CREATE POLICY "Public read active marquee" ON marquee_items
  FOR SELECT USING (
    is_active = TRUE
    AND site_id IN (SELECT id FROM sites WHERE status = 'active')
  );

CREATE POLICY "Public read templates" ON theme_templates
  FOR SELECT USING (is_public = TRUE);

-- Public insert for contact form
CREATE POLICY "Public insert contacts" ON contact_submissions
  FOR INSERT WITH CHECK (
    site_id IN (SELECT id FROM sites WHERE status = 'active')
  );

-- ============================================
-- Storage Bucket
-- ============================================
-- Create via Supabase Dashboard:
-- Bucket name: "media"
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif, image/svg+xml
```

---

## 5. TypeScript Type Definitions

```typescript
// packages/types/index.ts

// ============================================
// Module Config Types
// ============================================

export interface MarqueeConfig {
  enabled: boolean;
  speed: 'slow' | 'medium' | 'fast';
  items: string[];  // Deprecated: use marquee_items table instead
}

export interface NewsConfig {
  enabled: boolean;
  count: number;           // How many items to show
  layout: 'list' | 'card';
  showDate: boolean;
  categories?: string[];   // Filter by categories
}

export interface ArticlesConfig {
  enabled: boolean;
  layout: 'grid' | 'list' | 'magazine';
  perPage: number;
  showExcerpt: boolean;
  showCover: boolean;
}

export interface HeroConfig {
  enabled: boolean;
  type: 'image' | 'video' | 'gradient';
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  overlay: boolean;
  backgroundUrl?: string;
}

export interface ContactConfig {
  enabled: boolean;
  fields: string[];        // e.g. ['name', 'email', 'phone', 'message']
  notifyEmail: string;
  successMessage: string;
}

export interface FooterConfig {
  enabled: boolean;
  columns: number;
  links: Array<{
    label: string;
    url: string;
    group?: string;
  }>;
  showSocial: boolean;
  copyright: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    line?: string;
  };
}

export interface ModuleConfig {
  marquee: MarqueeConfig;
  news: NewsConfig;
  articles: ArticlesConfig;
  hero: HeroConfig;
  contact: ContactConfig;
  footer: FooterConfig;
}

// ============================================
// Theme Config Types
// ============================================

export interface ThemeColors {
  primary: string;      // Main brand color
  accent: string;       // CTA / highlight color
  background: string;   // Page background
  surface: string;      // Card / section background
  text: string;         // Primary text
  textSecondary: string; // Secondary text
  border: string;       // Border color
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  baseFontSize: string;
  headingWeight: string;
  lineHeight: string;
}

export interface ThemeLayout {
  maxWidth: string;
  borderRadius: string;
  spacing: string;
  headerStyle: 'fixed' | 'static' | 'transparent';
}

export interface ThemeConfig {
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  ai_prompt: string;     // The original prompt used to generate this theme
}

// ============================================
// SEO Config
// ============================================

export interface SeoConfig {
  title: string;
  description: string;
  ogImage: string;
  favicon: string;
  language: string;
}

// ============================================
// Site
// ============================================

export interface Site {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  status: 'active' | 'paused' | 'draft';
  module_config: ModuleConfig;
  theme_config: ThemeConfig;
  seo_config: SeoConfig;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

// ============================================
// Content Types
// ============================================

export interface Article {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;         // MDX string
  cover_image: string | null;
  category: string | null;
  tags: string[];
  status: 'published' | 'draft' | 'scheduled';
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: string;
  site_id: string;
  title: string;
  content: string | null;
  url: string | null;
  category: string | null;
  is_pinned: boolean;
  status: 'published' | 'draft';
  published_at: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MarqueeItem {
  id: string;
  site_id: string;
  text: string;
  url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface MediaItem {
  id: string;
  site_id: string;
  filename: string;
  storage_path: string;
  url: string;
  mime_type: string;
  size_bytes: number | null;
  alt_text: string | null;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  site_id: string;
  data: Record<string, string>;
  is_read: boolean;
  created_at: string;
}

export interface ThemeTemplate {
  id: string;
  name: string;
  description: string | null;
  preview_image: string | null;
  theme_config: ThemeConfig;
  is_public: boolean;
  created_at: string;
}
```

---

## 6. API Routes Specification

### 6.1 Dashboard API (apps/dashboard/app/api/)

All dashboard API routes require Supabase Auth. Check `auth.uid()` matches `sites.owner_id`.

#### Sites

```
GET    /api/sites                     → Site[]
POST   /api/sites                     → Site
  Body: { name, slug, ai_prompt? }
  Action: Create site + AI generate theme if prompt provided

GET    /api/sites/[siteId]            → Site
PATCH  /api/sites/[siteId]            → Site
  Body: Partial<Site>
DELETE /api/sites/[siteId]            → { success: true }
```

#### Modules

```
GET    /api/modules?siteId=xxx        → ModuleConfig
PATCH  /api/modules?siteId=xxx        → ModuleConfig
  Body: Partial<ModuleConfig>
  Example: { "marquee": { "enabled": true } }
  Action: Deep merge with existing config, save, trigger revalidation
```

#### Theme

```
GET    /api/theme?siteId=xxx          → ThemeConfig
PATCH  /api/theme?siteId=xxx          → ThemeConfig
  Body: Partial<ThemeConfig>

POST   /api/theme/generate            → ThemeConfig
  Body: { prompt: string, siteId: string }
  Action: Call Claude API → return generated ThemeConfig
  Returns 3 variants for user to pick from
```

#### Content

```
# Articles
GET    /api/content/articles?siteId=xxx              → Article[]
POST   /api/content/articles                          → Article
  Body: { site_id, title, slug, content, ... }
PATCH  /api/content/articles/[articleId]               → Article
DELETE /api/content/articles/[articleId]               → { success: true }

# News
GET    /api/content/news?siteId=xxx                   → NewsItem[]
POST   /api/content/news                              → NewsItem
PATCH  /api/content/news/[newsId]                      → NewsItem
DELETE /api/content/news/[newsId]                      → { success: true }

# Marquee
GET    /api/content/marquee?siteId=xxx                → MarqueeItem[]
POST   /api/content/marquee                           → MarqueeItem
PATCH  /api/content/marquee/[itemId]                   → MarqueeItem
DELETE /api/content/marquee/[itemId]                   → { success: true }
```

#### Media

```
POST   /api/media/upload                              → MediaItem
  Body: FormData with file + site_id
  Action: Upload to Supabase Storage, save metadata

GET    /api/media?siteId=xxx                          → MediaItem[]
DELETE /api/media/[mediaId]                            → { success: true }
```

#### Revalidation

```
POST   /api/revalidate
  Body: { siteId: string, paths?: string[] }
  Action: Call the target site's /api/revalidate endpoint
  Auth: Shared secret between dashboard and site instances
```

### 6.2 Site Engine API (apps/site/app/api/)

```
POST   /api/revalidate
  Body: { paths?: string[], secret: string }
  Auth: Check secret matches REVALIDATION_SECRET env var
  Action: revalidatePath() for specified paths or '/'

POST   /api/contact
  Body: { site_id: string, data: Record<string, string> }
  Action: Insert into contact_submissions, send email notification
  Rate limit: 5 per minute per IP
```

---

## 7. AI Style Generation

### 7.1 Claude API Integration

File: `apps/dashboard/app/api/theme/generate/route.ts`

```typescript
// System prompt for theme generation
const SYSTEM_PROMPT = `You are a web design system generator. Given a natural language description of a desired website style, generate a complete theme configuration as JSON.

You MUST respond with ONLY a valid JSON object, no markdown, no explanation.

The JSON must follow this exact structure:
{
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
    "headingFont": "<Google Font name>",
    "bodyFont": "<Google Font name>",
    "baseFontSize": "<px value>",
    "headingWeight": "<weight>",
    "lineHeight": "<unitless value>"
  },
  "layout": {
    "maxWidth": "<px value>",
    "borderRadius": "<px value>",
    "spacing": "<rem value>",
    "headerStyle": "fixed" | "static" | "transparent"
  }
}

Available Google Fonts (use only these):
- Sans-serif: Inter, Noto Sans TC, Noto Sans JP, Plus Jakarta Sans, DM Sans, Outfit, Manrope, Space Grotesk
- Serif: Noto Serif TC, Noto Serif JP, Playfair Display, Lora, Source Serif Pro, Crimson Text
- Mono: JetBrains Mono, Fira Code

Guidelines:
- Colors must have sufficient contrast (WCAG AA minimum)
- primary is used for headers, nav, key UI elements
- accent is used for CTA buttons, links, highlights
- background is the page background
- surface is for cards, sections that sit on top of background
- Always pick fonts that support the language implied by the description
- If the description mentions Japanese, include a JP font
- If the description mentions Chinese/Taiwanese, include a TC font
- borderRadius: "0px" for sharp/corporate, "4-8px" for modern, "12-16px" for soft/friendly, "9999px" for pill-shaped

Generate 3 variants:
1. Close match to the description
2. A bolder/more dramatic interpretation
3. A subtler/more minimal interpretation

Respond as: { "variants": [variant1, variant2, variant3] }`;

// User prompt template
const USER_PROMPT = (description: string) =>
  `Design a website theme based on this description: "${description}"`;
```

### 7.2 Theme Application (Site Engine)

File: `apps/site/components/ThemeProvider.tsx`

```typescript
// ThemeProvider reads theme_config and injects CSS custom properties
// This is the bridge between AI-generated config and actual rendering

export function ThemeProvider({ theme, children }: { theme: ThemeConfig; children: React.ReactNode }) {
  const cssVars = {
    '--color-primary': theme.colors.primary,
    '--color-accent': theme.colors.accent,
    '--color-bg': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-text': theme.colors.text,
    '--color-text-secondary': theme.colors.textSecondary,
    '--color-border': theme.colors.border,
    '--font-heading': theme.typography.headingFont,
    '--font-body': theme.typography.bodyFont,
    '--font-size-base': theme.typography.baseFontSize,
    '--font-weight-heading': theme.typography.headingWeight,
    '--line-height': theme.typography.lineHeight,
    '--max-width': theme.layout.maxWidth,
    '--border-radius': theme.layout.borderRadius,
    '--spacing': theme.layout.spacing,
  } as React.CSSProperties;

  return (
    <div style={cssVars}>
      {/* Google Fonts link */}
      <link
        href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.typography.headingFont)}:wght@400;700&family=${encodeURIComponent(theme.typography.bodyFont)}:wght@400;500;600&display=swap`}
        rel="stylesheet"
      />
      {children}
    </div>
  );
}
```

---

## 8. Module Renderer Pattern

File: `apps/site/components/ModuleRenderer.tsx`

```typescript
// This is the core pattern: read module_config, render only enabled modules

import { ModuleConfig } from '@siteforge/types';
import { Marquee } from './modules/Marquee';
import { NewsFeed } from './modules/NewsFeed';
import { Hero } from './modules/Hero';
import { ArticleGrid } from './modules/ArticleGrid';
import { ContactForm } from './modules/ContactForm';
import { Footer } from './modules/Footer';

interface Props {
  config: ModuleConfig;
  siteId: string;
}

export function ModuleRenderer({ config, siteId }: Props) {
  return (
    <>
      {config.marquee.enabled && (
        <Marquee siteId={siteId} config={config.marquee} />
      )}
      {config.hero.enabled && (
        <Hero config={config.hero} />
      )}
      {config.news.enabled && (
        <NewsFeed siteId={siteId} config={config.news} />
      )}
      {config.articles.enabled && (
        <ArticleGrid siteId={siteId} config={config.articles} />
      )}
      {config.contact.enabled && (
        <ContactForm siteId={siteId} config={config.contact} />
      )}
      {config.footer.enabled && (
        <Footer config={config.footer} />
      )}
    </>
  );
}
```

---

## 9. Site Config Resolution

File: `apps/site/lib/config.ts`

```typescript
// How the site engine knows which site it is:
// 1. Check custom domain (sites.domain)
// 2. Fall back to slug from env var SITE_SLUG

import { createClient } from '@supabase/supabase-js';
import { Site } from '@siteforge/types';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service role for server-side reads
);

export async function getSiteConfig(): Promise<Site> {
  const headersList = headers();
  const host = headersList.get('host') || '';
  
  // Try custom domain first
  let { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('domain', host)
    .eq('status', 'active')
    .single();
  
  // Fall back to SITE_SLUG env var
  if (!site) {
    const slug = process.env.SITE_SLUG;
    if (!slug) throw new Error('No SITE_SLUG configured');
    
    const { data } = await supabase
      .from('sites')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();
    
    site = data;
  }
  
  if (!site) throw new Error('Site not found or inactive');
  
  return site as Site;
}
```

---

## 10. Environment Variables

```bash
# .env.example

# ============================================
# Supabase (shared across dashboard + all sites)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ============================================
# Claude API (dashboard only)
# ============================================
ANTHROPIC_API_KEY=sk-ant-...

# ============================================
# Site Engine (each site instance)
# ============================================
SITE_SLUG=my-site-slug                  # Identifies which site this instance serves
REVALIDATION_SECRET=your-secret-here    # Shared secret for on-demand ISR

# ============================================
# Vercel (dashboard, for auto-deployment)
# ============================================
VERCEL_TOKEN=xxx                        # Optional: for Vercel API auto-deploy
VERCEL_TEAM_ID=xxx                      # Optional
```

---

## 11. Implementation Order

### Phase 1: Foundation (Week 1)

```
Task 1.1: Initialize monorepo
  - pnpm init, turbo.json, pnpm-workspace.yaml
  - Create apps/dashboard, apps/site, packages/types, packages/db

Task 1.2: Database
  - Run schema.sql in Supabase
  - Set up RLS policies
  - Create Supabase Storage bucket "media"

Task 1.3: Shared types
  - Implement packages/types/index.ts (all interfaces above)

Task 1.4: Core Engine (apps/site)
  - ThemeProvider component
  - ModuleRenderer component
  - Site config resolution (lib/config.ts)
  - All 6 module components (Marquee, NewsFeed, ArticleGrid, Hero, ContactForm, Footer)
  - Basic layout.tsx that loads config and wraps in ThemeProvider
  - page.tsx that renders ModuleRenderer

Task 1.5: Verify
  - Deploy one test site to Vercel
  - Manually insert a site row in Supabase
  - Confirm modules render based on config
```

### Phase 2: Dashboard MVP (Week 2)

```
Task 2.1: Auth
  - Supabase Auth setup (email/password for v1)
  - Login page, auth middleware

Task 2.2: Site management
  - Site list page (grid of cards with status badges)
  - Create site wizard (name, slug, optional AI prompt)
  - Site settings page (domain, SEO, status)

Task 2.3: Module management
  - Module toggle grid (visual switches for each module)
  - Per-module config editor (click module card → edit settings)
  - Save → write to Supabase → trigger revalidation

Task 2.4: Content management
  - Article editor (Markdown editor + live preview)
  - News CRUD (simple table + form)
  - Marquee items editor (drag-to-reorder list)
  - Media library (upload + grid view)
```

### Phase 3: AI Style (Days 11-15)

```
Task 3.1: Theme generation API
  - POST /api/theme/generate endpoint
  - Claude API integration with system prompt
  - Return 3 variants

Task 3.2: Theme editor UI
  - Left panel: text input for AI prompt + "Generate" button
  - Show 3 variant cards, click to select
  - Manual override: color pickers, font selectors, spacing controls
  - Right panel: live preview (iframe of site with draft theme)

Task 3.3: Theme template library
  - Save current theme as template
  - Browse and apply existing templates
  - Pre-seed 5-10 starter templates
```

### Phase 4: Deployment Automation (Days 16-20)

```
Task 4.1: Revalidation pipeline
  - Dashboard → site revalidation endpoint
  - On config save → auto-revalidate affected paths

Task 4.2: Site preview
  - Iframe preview in dashboard
  - Draft mode (preview unpublished changes)

Task 4.3: Documentation
  - README.md with setup instructions
  - How to add a new module guide
  - How to deploy a new site guide
```

---

## 12. Key Implementation Patterns

### 12.1 Module Toggle Save Flow

```
User toggles module switch in Dashboard
  → PATCH /api/modules?siteId=xxx  { "marquee": { "enabled": true } }
  → Deep merge with existing module_config in Supabase
  → Save merged config
  → POST /api/revalidate { siteId, paths: ['/'] }
  → Site engine's ISR revalidates
  → Next page load reflects new config
```

### 12.2 New Site Creation Flow

```
User clicks "New Site" in Dashboard
  → Enters: name, slug, (optional) AI style description
  → POST /api/sites { name, slug, ai_prompt }
  → Server:
    1. INSERT into sites table with default configs
    2. If ai_prompt provided: call Claude API → generate theme → update theme_config
    3. Return created site
  → User lands on site overview page
  → Manual step: deploy apps/site to new Vercel project with SITE_SLUG=<slug>
```

### 12.3 CSS Variable Convention

All modules MUST use these CSS variables for styling (never hardcode colors):

```css
/* Colors */
var(--color-primary)
var(--color-accent)
var(--color-bg)
var(--color-surface)
var(--color-text)
var(--color-text-secondary)
var(--color-border)

/* Typography */
var(--font-heading)
var(--font-body)
var(--font-size-base)
var(--font-weight-heading)
var(--line-height)

/* Layout */
var(--max-width)
var(--border-radius)
var(--spacing)
```

### 12.4 Adding a New Module (for future extension)

1. Define config interface in `packages/types/index.ts`
2. Add to `ModuleConfig` interface
3. Add default config to `sites` table default
4. Create React component in `apps/site/components/modules/`
5. Add to `ModuleRenderer.tsx`
6. Add toggle + config UI in `apps/dashboard`
7. All sites automatically get the new module (disabled by default)

---

## 13. Constraints & Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | Single Supabase instance, site_id FK | Simpler ops for <50 sites. Split later if needed. |
| Monorepo tool | Turborepo | Fits Next.js ecosystem, pnpm workspace native support. |
| AI model | claude-sonnet-4-20250514 | Good enough for JSON generation, fast, cost-effective. |
| CSS approach | Tailwind + CSS Custom Properties | Tailwind for utility classes, CSS vars for theme injection. |
| Content format | MDX in database (text column) | Simpler than file-based MDX for multi-site. No git per site needed. |
| Auth | Supabase Auth, email/password | v1 is single-user (Erin). No need for SSO yet. |
| Deploy per site | Manual Vercel project + env vars | Full automation via Vercel API is Phase 4. |
| Module order | Fixed order in ModuleRenderer | v1 doesn't need drag-to-reorder. Header position order is sensible default. |

---

*End of Technical PRD. This document contains everything needed to build SiteForge from scratch.*
