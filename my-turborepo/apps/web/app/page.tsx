import { DashboardClientGate } from '@/components/dashboard/dashboard-client-gate';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  let initialLayoutId = params.layout || 'single';

  if (Array.isArray(initialLayoutId)) {
    initialLayoutId = initialLayoutId.at(0) ?? 'single';
  }

  return <DashboardClientGate initialLayoutId={initialLayoutId} />;
}
