'use client';

import { useQueryState, parseAsString } from 'nuqs';
import { DataType } from '@/lib/widget-registry';

export function useDashboardParams() {
  // Get target_id ?target=ALL
  const [targetId, setTargetId] = useQueryState('target', parseAsString.withDefault('ALL'));

  // Get version (snapshot) per data type
  // ?pricing_v=latest, ?event_v=...
  // e.g. ?event_v=20251231_1200.parquet&pricing_v=latest
  const [pricesVersion, setPricesVersion] = useQueryState('prices_v', parseAsString.withDefault('latest'));
  const [eventsVersion, setEventsVersion] = useQueryState('calendar_events_v', parseAsString.withDefault('latest'));
  const [guidelinesVersion, setGuidelinesVersion] = useQueryState('guidelines_v', parseAsString.withDefault('latest'));

  const setVersion = (type: DataType, value: string) => {
    if (type === 'prices') setPricesVersion(value);
    if (type === 'calendar_events') setEventsVersion(value);
    if (type === 'guidelines') setGuidelinesVersion(value);
  };

  const versions = {
    prices: pricesVersion,
    calendar_events: eventsVersion,
    guideline_results: guidelinesVersion,
  };

  return {
    targetId,
    setTargetId,
    versions,
    setVersion,
  };
}
