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

export interface ProcessStep {
  title: string;
  description: string;
}

export interface ProcessConfig {
  enabled: boolean;
  title: string;
  steps: ProcessStep[];
}

export interface CtaConfig {
  enabled: boolean;
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
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
  process?: ProcessConfig;
  cta?: CtaConfig;
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

// ============================================
// Dynamic Pages — composable block system
// ============================================

export interface HeroBlockConfig {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundUrl?: string;
  align?: 'left' | 'center';
}

export interface TextBlockConfig {
  eyebrow?: string;
  heading?: string;
  body: string;
  align?: 'left' | 'center';
  narrow?: boolean;
}

export interface FeaturesGridItem {
  title: string;
  description: string;
  icon?: string;
}

export interface FeaturesGridConfig {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  items: FeaturesGridItem[];
  columns?: 2 | 3 | 4;
}

export interface CtaBlockConfig {
  title: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
}

export interface ContactFormBlockConfig {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  fields?: Array<'name' | 'email' | 'phone' | 'company' | 'message'>;
  successMessage?: string;
  submitText?: string;
}

export interface TeamMember {
  name: string;
  title: string;
  bio?: string;
  photoUrl?: string;
}

export interface TeamGridConfig {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  members: TeamMember[];
  columns?: 2 | 3 | 4;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqBlockConfig {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  items: FaqItem[];
}

export interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
}

export interface GalleryBlockConfig {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
}

export interface CaseItem {
  title: string;
  client?: string;
  description: string;
  results?: string;
  tags?: string[];
  imageUrl?: string;
  url?: string;
}

export interface CasesGridConfig {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  items: CaseItem[];
  columns?: 2 | 3;
}

export interface StatItem {
  value: string;
  label: string;
  suffix?: string;
}

export interface StatsBlockConfig {
  eyebrow?: string;
  heading?: string;
  items: StatItem[];
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
}

export interface TestimonialsBlockConfig {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  items: TestimonialItem[];
  columns?: 1 | 2 | 3;
}

export interface TwoColumnBlockConfig {
  eyebrow?: string;
  heading?: string;
  body: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
  ctaText?: string;
  ctaUrl?: string;
}

export interface ProcessStepItemV2 {
  title: string;
  description: string;
}

export interface ProcessStepsBlockConfig {
  eyebrow?: string;
  heading?: string;
  intro?: string;
  items: ProcessStepItemV2[];
}

export type Section =
  | { type: 'hero'; config: HeroBlockConfig }
  | { type: 'text'; config: TextBlockConfig }
  | { type: 'features_grid'; config: FeaturesGridConfig }
  | { type: 'cta'; config: CtaBlockConfig }
  | { type: 'contact_form'; config: ContactFormBlockConfig }
  | { type: 'team_grid'; config: TeamGridConfig }
  | { type: 'faq'; config: FaqBlockConfig }
  | { type: 'gallery'; config: GalleryBlockConfig }
  | { type: 'cases_grid'; config: CasesGridConfig }
  | { type: 'stats'; config: StatsBlockConfig }
  | { type: 'testimonials'; config: TestimonialsBlockConfig }
  | { type: 'two_column'; config: TwoColumnBlockConfig }
  | { type: 'process_steps'; config: ProcessStepsBlockConfig };

export interface PageSeo {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface Page {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  nav_label: string | null;
  seo: PageSeo;
  sections: Section[];
  sort_order: number;
  is_published: boolean;
  show_in_nav: boolean;
  created_at: string;
  updated_at: string;
}
