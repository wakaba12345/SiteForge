import { isAuthenticated } from '@/lib/admin-auth';
import { getAdminSite } from '@/lib/admin-site';
import AdminNav from './AdminNav';

export const metadata = { title: '後台管理' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated();
  if (!authed) {
    return <div className="bg-gray-50 min-h-screen">{children}</div>;
  }
  const site = await getAdminSite();
  return (
    <div className="bg-gray-50 text-gray-900 antialiased min-h-screen">
      <AdminNav siteName={site.name} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
