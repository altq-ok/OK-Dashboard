'use client';

import dynamic from 'next/dynamic';

// Use dynamic import and turn off SSR (Server Side Rendering) for DashboardMain
const DashboardMain = dynamic(() => import('./dashboard-main').then((mod) => mod.DashboardMain), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-background" />,
});

export function DashboardClientGate({ initialLayoutId }: { initialLayoutId: string }) {
  return <DashboardMain initialLayoutId={initialLayoutId} />;
}
