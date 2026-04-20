'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '', label: '概覽' },
  { href: '/modules', label: '功能模組' },
  { href: '/theme', label: '主題風格' },
  { href: '/generate', label: '✦ AI 內容生成', highlight: true },
  { href: '/contacts', label: '聯絡表單', badge: true },
  { href: '/settings', label: '設定' },
];

export function SiteNav({ base, unreadContacts = 0 }: { base: string; unreadContacts?: number }) {
  const pathname = usePathname();

  return (
    <nav className="w-48 shrink-0 bg-white border-r border-slate-200 py-4">
      {NAV.map(({ href, label, highlight, badge }) => {
        const full = `${base}${href}`;
        const isActive = href === '' ? pathname === full : pathname.startsWith(full);
        const showBadge = badge && unreadContacts > 0;
        return (
          <Link
            key={href}
            href={full}
            className={`flex items-center justify-between px-5 py-2 text-sm transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600'
                : highlight
                ? 'text-blue-600 hover:bg-blue-50'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span>{label}</span>
            {showBadge && (
              <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center leading-none">
                {unreadContacts}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
