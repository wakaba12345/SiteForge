import { getSiteConfig } from '@/lib/config';
import { ModuleRenderer } from '@/components/ModuleRenderer';

export const revalidate = 3600;

export default async function HomePage() {
  const site = await getSiteConfig();
  return <ModuleRenderer config={site.module_config} siteId={site.id} />;
}
