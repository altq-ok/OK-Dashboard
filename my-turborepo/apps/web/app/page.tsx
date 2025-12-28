import { DashboardMain } from '@/components/dashboard/dashboard-main';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const initialLayoutId = params.layout || 'single';

  return <DashboardMain initialLayoutId={initialLayoutId} />;
}
