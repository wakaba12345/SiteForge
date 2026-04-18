import type { FooterConfig } from '@siteforge/types';

interface Props {
  config: FooterConfig;
}

export function Footer({ config }: Props) {
  const groups = Array.from(new Set(config.links.map((l) => l.group ?? '')));

  return (
    <footer
      className="py-10 px-6 mt-auto"
      style={{ background: 'var(--color-primary)', color: 'rgba(255,255,255,0.8)' }}
    >
      <div className="mx-auto" style={{ maxWidth: 'var(--max-width)' }}>
        {config.links.length > 0 && (
          <div
            className={`grid gap-8 mb-8`}
            style={{ gridTemplateColumns: `repeat(${Math.min(config.columns, groups.length || 1)}, minmax(0, 1fr))` }}
          >
            {groups.map((group) => (
              <div key={group}>
                {group && <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">{group}</h4>}
                <ul className="space-y-2">
                  {config.links
                    .filter((l) => (l.group ?? '') === group)
                    .map((link, i) => (
                      <li key={i}>
                        <a href={link.url} className="text-sm hover:text-white transition-colors">
                          {link.label}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {config.showSocial && config.socialLinks && (
          <div className="flex gap-4 mb-6">
            {config.socialLinks.facebook && (
              <a href={config.socialLinks.facebook} className="hover:text-white text-sm">Facebook</a>
            )}
            {config.socialLinks.instagram && (
              <a href={config.socialLinks.instagram} className="hover:text-white text-sm">Instagram</a>
            )}
            {config.socialLinks.twitter && (
              <a href={config.socialLinks.twitter} className="hover:text-white text-sm">Twitter</a>
            )}
            {config.socialLinks.line && (
              <a href={config.socialLinks.line} className="hover:text-white text-sm">LINE</a>
            )}
          </div>
        )}

        {config.copyright && (
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {config.copyright}
          </p>
        )}
      </div>
    </footer>
  );
}
