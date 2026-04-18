import { isAuthenticated } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import NewsClient from './NewsClient';

export const dynamic = 'force-dynamic';

export default async function AdminNewsPage() {
  if (!(await isAuthenticated())) redirect('/admin/login');
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0d1f3c]">最新消息管理</h1>
        <a
          href="/admin/news/new"
          className="rounded bg-[#c9a84c] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8973f]"
        >
          + 新增消息
        </a>
      </div>
      <NewsClient />
    </div>
  );
}
