export interface MarqueeConfig {
  enabled: boolean;
  speed: 'slow' | 'medium' | 'fast';
  items: string[];
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface FeaturesConfig {
  enabled: boolean;
  title: string;
  items: FeatureItem[];
}

export interface NewsConfig {
  enabled: boolean;
  count: number;
  layout: 'list' | 'card';
  showDate: boolean;
  categories?: string[];
}

export interface ArticlesConfig {
  enabled: boolean;
  layout: 'grid' | 'list' | 'magazine' | 'features';
  perPage: number;
  showExcerpt: boolean;
  showCover: boolean;
}

export interface HeroConfig {
  enabled: boolean;
  type: 'image' | 'video' | 'gradient';
  layout?: 'centered' | 'split' | 'minimal';
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  overlay: boolean;
  backgroundUrl?: string;
}

export interface ContactConfig {
  enabled: boolean;
  fields: string[];
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

export interface SocialConfig {
  enabled: boolean;
  line: string;
  facebook: string;
  email: string;
  position: 'left' | 'right';
}

export interface ModuleConfig {
  marquee: MarqueeConfig;
  news: NewsConfig;
  articles: ArticlesConfig;
  hero: HeroConfig;
  contact: ContactConfig;
  footer: FooterConfig;
  social: SocialConfig;
  features?: FeaturesConfig;
}

export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
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
  ai_prompt: string;
}

export interface SeoConfig {
  title: string;
  description: string;
  ogImage: string;
  favicon: string;
  language: string;
  vercel_project_id?: string;
  vercel_url?: string;
  admin_password?: string;
  admin_hmac_secret?: string;
}

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

export interface Article {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
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
