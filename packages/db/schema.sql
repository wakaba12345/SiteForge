-- ============================================
-- SiteForge Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. SITES
-- ============================================
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('active', 'paused', 'draft')),

  module_config JSONB NOT NULL DEFAULT '{"marquee":{"enabled":false,"speed":"medium","items":[]},"news":{"enabled":false,"count":5,"layout":"list","showDate":true},"articles":{"enabled":true,"layout":"grid","perPage":12,"showExcerpt":true,"showCover":true},"hero":{"enabled":false,"type":"image","title":"","subtitle":"","ctaText":"","ctaUrl":"","overlay":true},"contact":{"enabled":false,"fields":["name","email","message"],"successMessage":"已收到您的訊息，我們會盡快回覆。"},"footer":{"enabled":true,"columns":3,"links":[],"showSocial":false,"copyright":""},"social":{"enabled":false,"line":"","facebook":"","email":"","position":"right"}}'::jsonb,

  theme_config JSONB NOT NULL DEFAULT '{"colors":{"primary":"#1A1A2E","accent":"#E94560","background":"#FFFFFF","surface":"#F9FAFB","text":"#111827","textSecondary":"#6B7280","border":"#E5E7EB"},"typography":{"headingFont":"Noto Sans TC","bodyFont":"Inter","baseFontSize":"16px","headingWeight":"700","lineHeight":"1.6"},"layout":{"maxWidth":"1200px","borderRadius":"8px","spacing":"1.5rem","headerStyle":"fixed"},"ai_prompt":""}'::jsonb,

  seo_config JSONB NOT NULL DEFAULT '{"title":"","description":"","ogImage":"","favicon":"","language":"zh-TW"}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id)
);

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
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('published', 'draft', 'scheduled')),
  published_at TIMESTAMPTZ,
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
-- 3. NEWS
-- ============================================
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT,
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
-- 4. MARQUEE ITEMS
-- ============================================
CREATE TABLE marquee_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_marquee_site_id ON marquee_items(site_id, is_active, sort_order);

-- ============================================
-- 5. MEDIA
-- ============================================
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INT,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_site_id ON media(site_id, created_at DESC);

-- ============================================
-- 6. THEME TEMPLATES
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
-- 7. CONTACT SUBMISSIONS
-- ============================================
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_site_id ON contact_submissions(site_id, is_read, created_at DESC);

-- ============================================
-- 8. PAGES (dynamic static pages composed of sections)
-- Each site can have unlimited pages; each page is an array of typed blocks.
-- ============================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  nav_label TEXT,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  show_in_nav BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

DROP TRIGGER IF EXISTS pages_updated_at ON pages;
CREATE TRIGGER pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_pages_site_slug ON pages(site_id, slug);
CREATE INDEX IF NOT EXISTS idx_pages_site_order ON pages(site_id, sort_order);

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
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Public insert contacts" ON contact_submissions
  FOR INSERT WITH CHECK (
    site_id IN (SELECT id FROM sites WHERE status = 'active')
  );

DROP POLICY IF EXISTS "Owner pages" ON pages;
CREATE POLICY "Owner pages" ON pages
  FOR ALL USING (site_id IN (SELECT id FROM sites WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Public read published pages" ON pages;
CREATE POLICY "Public read published pages" ON pages
  FOR SELECT USING (
    is_published = TRUE
    AND site_id IN (SELECT id FROM sites WHERE status = 'active')
  );

-- ============================================
-- Storage: create bucket "media" manually in Supabase Dashboard
-- Public: true, size limit: 10MB
-- Allowed MIME: image/jpeg, image/png, image/webp, image/gif, image/svg+xml
-- ============================================
