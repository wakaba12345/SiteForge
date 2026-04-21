import type { Section } from '@siteforge/types';
import { HeroBlock } from './Hero';
import { TextBlock } from './Text';
import { FeaturesGridBlock } from './FeaturesGrid';
import { CtaBlock } from './Cta';
import { ContactFormBlock } from './ContactForm';
import { TeamGridBlock } from './TeamGrid';
import { FaqBlock } from './Faq';
import { GalleryBlock } from './Gallery';
import { CasesGridBlock } from './CasesGrid';
import { StatsBlock } from './Stats';
import { TestimonialsBlock } from './Testimonials';
import { TwoColumnBlock } from './TwoColumn';
import { ProcessStepsBlock } from './ProcessSteps';

type BlockComponent = (p: { config: any; siteId: string }) => JSX.Element | null;

export const BLOCKS: Record<Section['type'], BlockComponent> = {
  hero: HeroBlock,
  text: TextBlock,
  features_grid: FeaturesGridBlock,
  cta: CtaBlock,
  contact_form: ContactFormBlock,
  team_grid: TeamGridBlock,
  faq: FaqBlock,
  gallery: GalleryBlock,
  cases_grid: CasesGridBlock,
  stats: StatsBlock,
  testimonials: TestimonialsBlock,
  two_column: TwoColumnBlock,
  process_steps: ProcessStepsBlock,
};
