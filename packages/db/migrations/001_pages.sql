-- ============================================
-- Migration 001: Dynamic static pages
-- Adds `pages` table for composable block-based pages per site.
-- Safe to re-run (uses IF NOT EXISTS / DROP POLICY IF EXISTS).
-- Run in Supabase SQL Editor.
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

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner pages" ON pages;
CREATE POLICY "Owner pages" ON pages
  FOR ALL USING (site_id IN (SELECT id FROM sites WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Public read published pages" ON pages;
CREATE POLICY "Public read published pages" ON pages
  FOR SELECT USING (
    is_published = TRUE
    AND site_id IN (SELECT id FROM sites WHERE status = 'active')
  );
