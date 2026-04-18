import type { SocialConfig } from '@siteforge/types';

interface Props {
  config: SocialConfig;
}

export function SocialLinks({ config }: Props) {
  const links = [
    config.line && {
      href: config.line.startsWith('http') ? config.line : `https://line.me/R/ti/p/${config.line}`,
      label: 'LINE',
      bg: '#06C755',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M12 0C5.373 0 0 4.973 0 11.09c0 5.436 4.478 9.965 10.526 10.934.413.089.975.271.975.826 0 .454-.031.991-.091 1.452-.059.461-.375 1.866-.375 1.866s-.066.269-.135.378c-.068.11-.179.178-.298.178-.219 0-.402-.118-.567-.226C4.25 24.08 0 18.27 0 11.09 0 4.973 5.373 0 12 0s12 4.973 12 11.09c0 5.436-4.478 9.965-10.526 10.934-.413.089-.975.271-.975.826 0 .454.031.991.091 1.452.059.461.375 1.866.375 1.866s.066.269.135.378c.068.11.179.178.298.178.219 0 .402-.118.567-.226C19.75 24.08 24 18.27 24 11.09 24 4.973 18.627 0 12 0" />
        </svg>
      ),
    },
    config.facebook && {
      href: config.facebook.startsWith('http') ? config.facebook : `https://facebook.com/${config.facebook}`,
      label: 'Facebook',
      bg: '#1877F2',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    config.email && {
      href: `mailto:${config.email}`,
      label: 'Email',
      bg: '#6B7280',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ),
    },
  ].filter(Boolean) as { href: string; label: string; bg: string; icon: React.ReactNode }[];

  if (!links.length) return null;

  const side = config.position === 'left' ? 'left-4' : 'right-4';

  return (
    <div className={`fixed ${side} bottom-8 z-50 flex flex-col gap-2`}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label}
          className="flex items-center justify-center w-11 h-11 rounded-full text-white shadow-lg hover:scale-110 transition-transform"
          style={{ background: link.bg }}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
