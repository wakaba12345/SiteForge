'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: '文章管理' },
  { href: '/admin/news', label: '最新消息' },
  { href: '/admin/marquee', label: '跑馬燈' },
];

export default function AdminNav({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  }

  return (
    <nav className="bg-[#0d1f3c] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/admin" className="text-lg font-bold tracking-wide">
          {siteName} 後台
        </Link>
        <div className="flex items-center gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors hover:text-[#c9a84c] ${
                (link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href))
                  ? 'text-[#c9a84c]'
                  : 'text-white/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="rounded bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
          >
            登出
          </button>
        </div>
      </div>
    </nav>
  );
}
