import type { ModuleConfig } from '@siteforge/types';
import { Marquee } from './modules/Marquee';
import { Hero } from './modules/Hero';
import { FeaturesSection } from './modules/FeaturesSection';
import { ProcessSection } from './modules/ProcessSection';
import { NewsFeed } from './modules/NewsFeed';
import { ArticleGrid } from './modules/ArticleGrid';
import { CtaSection } from './modules/CtaSection';
import { ContactForm } from './modules/ContactForm';
import { Footer } from './modules/Footer';
import { SocialLinks } from './modules/SocialLinks';

interface Props {
  config: ModuleConfig;
  siteId: string;
}

// Landing page conversion flow (JapanLive pattern):
// 跑馬燈 → Hero (痛點) → 差異化 → 服務流程 → 知識庫 → 最新消息 → 最終CTA → 聯絡表單 → Footer
export function ModuleRenderer({ config, siteId }: Props) {
  return (
    <>
      {config.marquee?.enabled && <Marquee siteId={siteId} config={config.marquee} />}
      {config.hero?.enabled && <Hero config={config.hero} />}
      {config.features?.enabled && <FeaturesSection config={config.features} />}
      {config.process?.enabled && <ProcessSection config={config.process} />}
      {config.articles?.enabled && <ArticleGrid siteId={siteId} config={config.articles} />}
      {config.news?.enabled && <NewsFeed siteId={siteId} config={config.news} />}
      {config.cta?.enabled && <CtaSection config={config.cta} />}
      {config.contact?.enabled && <ContactForm siteId={siteId} config={config.contact} />}
      {config.footer?.enabled && <Footer config={config.footer} />}
      {config.social?.enabled && <SocialLinks config={config.social} />}
    </>
  );
}
