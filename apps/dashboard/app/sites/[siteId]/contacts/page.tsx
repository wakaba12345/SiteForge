import { createServerClient } from '@/lib/supabase-server';
import { getContactSubmissions, markContactRead } from '@siteforge/db';

export default async function ContactsPage({ params }: { params: { siteId: string } }) {
  const supabase = createServerClient();
  const submissions = await getContactSubmissions(supabase as any, params.siteId);

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">聯絡表單</h1>

      {submissions.length === 0 ? (
        <p className="text-sm text-slate-400">尚無表單提交</p>
      ) : (
        <div className="flex flex-col gap-3">
          {submissions.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-xl border p-5 ${s.is_read ? 'border-slate-200' : 'border-blue-300 shadow-sm'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-slate-400">
                  {new Date(s.created_at).toLocaleString('zh-TW')}
                </p>
                {!s.is_read && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">未讀</span>
                )}
              </div>
              <dl className="space-y-1">
                {Object.entries(s.data).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-sm">
                    <dt className="text-slate-400 w-16 shrink-0">{k}</dt>
                    <dd className="text-slate-700 break-all">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
