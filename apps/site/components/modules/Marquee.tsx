import { getActiveMarqueeItems } from '@siteforge/db';
import { createServerClient } from '@siteforge/db';
import type { MarqueeConfig } from '@siteforge/types';

const speedMap = { slow: '30s', medium: '20s', fast: '10s' };

interface Props {
  siteId: string;
  config: MarqueeConfig;
}

export async function Marquee({ siteId, config }: Props) {
  const supabase = createServerClient();
  const items = await getActiveMarqueeItems(supabase, siteId);

  if (!items.length) return null;

  const duration = speedMap[config.speed];
  const repeated = [...items, ...items];

  return (
    <div
      className="overflow-hidden py-2 text-sm font-medium"
      style={{ background: 'var(--color-primary)', color: '#fff', overflow: 'hidden' }}
    >
      <div
        className="flex whitespace-nowrap"
        style={{ display: 'flex', whiteSpace: 'nowrap', animation: `marquee-scroll ${duration} linear infinite` }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="mx-8">
            {item.url ? (
              <a href={item.url} className="hover:underline">
                {item.text}
              </a>
            ) : (
              item.text
            )}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
