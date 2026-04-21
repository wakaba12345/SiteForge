import type { Section } from '@siteforge/types';
import { BLOCKS } from './blocks';

export function PageRenderer({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section, i) => {
        const Block = BLOCKS[section.type];
        if (!Block) return null;
        return <Block key={i} config={section.config} />;
      })}
    </>
  );
}
