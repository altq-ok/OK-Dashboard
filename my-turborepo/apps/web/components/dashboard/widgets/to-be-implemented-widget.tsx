'use client';

import { useSnapshot } from '@/hooks/use-snapshot';
import { useDashboardParams } from '@/hooks/use-dashboard-params';
import { WidgetProps } from '@/lib/widget-registry';
import { LoadingWidget } from './loading-widget';

export function TBIWidget({ targetId }: WidgetProps) {
  // This is an example to use snapshots
  const { versions } = useDashboardParams();
  const { result: calendarEvents, isDataLoading } = useSnapshot(targetId, 'calendar_events', versions.calendar_events);

  return <LoadingWidget message="TO BE IMPLEMENTED..." />;
}
