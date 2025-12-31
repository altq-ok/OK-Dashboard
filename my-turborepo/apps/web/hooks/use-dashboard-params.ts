'use client';

import { useQueryState, parseAsString } from 'nuqs';

export type TaskType = 'pricing' | 'event' | 'guideline';

export function useDashboardParams() {
  // Get target_id ?target=ALL
  const [targetId, setTargetId] = useQueryState('target', parseAsString.withDefault('ALL'));

  // Get version (snapshot) per data type
  // ?pricing_v=latest, ?event_v=...
  // e.g. ?event_v=20251231_1200.parquet&pricing_v=latest
  const [pricingVersion, setPricingVersion] = useQueryState('pricing_v', parseAsString.withDefault('latest'));
  const [eventVersion, setEventVersion] = useQueryState('event_v', parseAsString.withDefault('latest'));
  const [guidelineVersion, setGuidelineVersion] = useQueryState('guideline_v', parseAsString.withDefault('latest'));

  const setVersion = (type: TaskType, value: string) => {
    if (type === 'pricing') setPricingVersion(value);
    if (type === 'event') setEventVersion(value);
    if (type === 'guideline') setGuidelineVersion(value);
  };

  const versions = {
    pricing: pricingVersion,
    event: eventVersion,
    guideline: guidelineVersion,
  };

  return {
    targetId,
    setTargetId,
    versions,
    setVersion,
  };
}
