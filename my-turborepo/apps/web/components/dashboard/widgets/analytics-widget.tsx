'use client';

import { useSnapshot } from '@/hooks/use-snapshot';
import { useDashboardParams } from '@/hooks/use-dashboard-params';
import { WidgetProps } from '@/lib/widget-registry';
import { LoadingWidget } from './loading-widget';

export function AnalyticsWidget({ targetId }: WidgetProps) {
  const { versions } = useDashboardParams();
  const { result: prices, isDataLoading } = useSnapshot(targetId, 'prices', versions.prices);

  return <LoadingWidget message="TO BE IMPLEMENTED..." />;
}
