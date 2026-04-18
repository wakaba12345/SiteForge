'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '', label: '概覽' },
  { href: '/modules', label: '功能模組' },
  { href: '/theme', label: '主題風格' },
  { href: '/generate', label: '✦ AI 內容生成', highlight: true },
  { href: '/preview', label: '預覽' },
  { href: '/settings', label: '設定' },
];

export function SiteNav({ base }: { base: string }) {
  const pathname = usePathname();

  return (
    <nav className="w-48 shrink-0 bg-white border-r border-slate-200 py-4">
      {NAV.map(({ href, label, highlight }) => {
        const full = `${base}${href}`;
        const isActive = href === '' ? pathname === full : pathname.startsWith(full);
        return (
          <Link
            key={href}
            href={full}
            className={`block px-5 py-2 text-sm transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600'
                : highlight
                ? 'text-blue-600 hover:bg-blue-50'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
