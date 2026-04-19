import { isAuthenticated } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
import ArticleForm from '../ArticleForm';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  if (!(await isAuthenticated())) redirect('/admin/login');
  const aiEnabled = !!process.env.ANTHROPIC_API_KEY;
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0d1f3c]">新增文章</h1>
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-700">← 返回列表</a>
      </div>
      <ArticleForm aiEnabled={aiEnabled} />
    </div>
  );
}
