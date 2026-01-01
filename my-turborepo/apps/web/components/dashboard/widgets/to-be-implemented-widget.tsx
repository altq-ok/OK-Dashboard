'use client';

import { useSnapshot } from '@/hooks/use-snapshot';
import { useDashboardParams } from '@/hooks/use-dashboard-params';
import { WidgetProps } from '@/lib/widget-registry';

export function TBIWidget({ targetId }: WidgetProps) {
  const { versions } = useDashboardParams();
  const { result: calendarEvents, isDataLoading } = useSnapshot(targetId, 'calendar_events', versions.calendar_events);

  if (isDataLoading) return <div>Loading data...</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <pre className="text-[10px] font-mono">{JSON.stringify(calendarEvents, null, 2)}</pre>
    </div>
  );
}
