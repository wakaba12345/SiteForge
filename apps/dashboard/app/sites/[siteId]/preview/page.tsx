import { createServerClient } from '@/lib/supabase-server';

export default async function PreviewPage({ params }: { params: { siteId: string } }) {
  const supabase = createServerClient();
  const { data: site } = await supabase.from('sites').select('domain, slug').eq('id', params.siteId).single();

  const previewUrl = site?.domain
    ? `https://${site.domain}`
    : site?.slug
    ? `https://${site.slug}.vercel.app`
    : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-semibold text-slate-900">預覽</h1>
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            在新分頁開啟 →
          </a>
        )}
      </div>

      {previewUrl ? (
        <iframe
          src={previewUrl}
          className="flex-1 w-full rounded-xl border border-slate-200"
          style={{ minHeight: '600px' }}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
          請先在設定頁面配置網域或部署到 Vercel
        </div>
      )}
    </div>
  );
}
