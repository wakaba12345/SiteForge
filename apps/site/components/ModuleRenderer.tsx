import type { ModuleConfig } from '@siteforge/types';
import { Marquee } from './modules/Marquee';
import { Hero } from './modules/Hero';
import { FeaturesSection } from './modules/FeaturesSection';
import { NewsFeed } from './modules/NewsFeed';
import { ArticleGrid } from './modules/ArticleGrid';
import { ContactForm } from './modules/ContactForm';
import { Footer } from './modules/Footer';
import { SocialLinks } from './modules/SocialLinks';

interface Props {
  config: ModuleConfig;
  siteId: string;
}

export function ModuleRenderer({ config, siteId }: Props) {
  return (
    <>
      {config.marquee?.enabled && <Marquee siteId={siteId} config={config.marquee} />}
      {config.hero?.enabled && <Hero config={config.hero} />}
      {config.features?.enabled && <FeaturesSection config={config.features!} />}
      {config.news?.enabled && <NewsFeed siteId={siteId} config={config.news} />}
      {config.articles?.enabled && <ArticleGrid siteId={siteId} config={config.articles} />}
      {config.contact?.enabled && <ContactForm siteId={siteId} config={config.contact} />}
      {config.footer?.enabled && <Footer config={config.footer} />}
      {config.social?.enabled && <SocialLinks config={config.social} />}
    </>
  );
}
