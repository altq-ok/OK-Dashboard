'use client';

import { useSnapshot } from '@/hooks/use-snapshot';
import { useDashboardParams } from '@/hooks/use-dashboard-params';
import { WidgetProps } from '@/lib/widget-registry';
import { LoadingWidget } from './loading-widget';

import { DataPoint, MultiSeriesChart } from './sample-performance-chart';

export const generateMockData = (days: number = 60): DataPoint[] => {
  const data: DataPoint[] = [];

  // Starting values
  let p1 = 150;
  let p2 = 135;

  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i));

    // Create a "random walk" (price moves based on previous price)
    p1 += (Math.random() - 0.48) * 4; // Slight upward bias
    p2 += (Math.random() - 0.5) * 3;

    // Generate volume with occasional spikes
    const vol = Math.floor(Math.random() * 5000) + (Math.random() > 0.9 ? 3000 : 1000);

    // Inject missing data:
    // Every 15th point is missing p1, every 20th is missing volume
    const isP1Missing = i > 0 && i % 15 === 0;
    const isVolMissing = i > 0 && i % 20 === 0;

    data.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD
      price1: isP1Missing ? null : parseFloat(p1.toFixed(2)),
      price2: parseFloat(p2.toFixed(2)),
      volume: isVolMissing ? null : vol,
    });
  }

  return data;
};

export function AnalyticsWidget({ targetId }: WidgetProps) {
  const { versions } = useDashboardParams();
  const { result: prices, isDataLoading } = useSnapshot(targetId, 'prices', versions.prices);

  const data = generateMockData();

  // return <LoadingWidget message="TO BE IMPLEMENTED..." />;
  return <MultiSeriesChart data={data} />;
}
