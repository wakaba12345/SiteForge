import type { Section } from '@siteforge/types';
import { HeroBlock } from './Hero';
import { TextBlock } from './Text';
import { FeaturesGridBlock } from './FeaturesGrid';
import { CtaBlock } from './Cta';

export const BLOCKS: Record<Section['type'], (p: { config: any }) => JSX.Element | null> = {
  hero: HeroBlock,
  text: TextBlock,
  features_grid: FeaturesGridBlock,
  cta: CtaBlock,
};
