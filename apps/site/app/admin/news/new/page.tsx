import { isAuthenticated } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import NewsForm from '../NewsForm';

export const dynamic = 'force-dynamic';

export default async function NewNewsPage() {
  if (!(await isAuthenticated())) redirect('/admin/login');
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0d1f3c]">新增消息</h1>
        <a href="/admin/news" className="text-sm text-gray-500 hover:text-gray-700">← 返回列表</a>
      </div>
      <NewsForm />
    </div>
  );
}
