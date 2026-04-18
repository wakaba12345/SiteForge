import { isAuthenticated } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import MarqueeClient from './MarqueeClient';

export const dynamic = 'force-dynamic';

export default async function AdminMarqueePage() {
  if (!(await isAuthenticated())) redirect('/admin/login');
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0d1f3c]">跑馬燈管理</h1>
        <p className="mt-1 text-sm text-gray-500">管理頁面頂部的滾動文字公告</p>
      </div>
      <MarqueeClient />
    </div>
  );
}
