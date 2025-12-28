'use client';

import { useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { DASHBOARD_TEMPLATES } from '@/lib/layout-templates';
import { RecursiveLayout } from './recursive-layout';
import { LayoutNode } from '@/types/dashboard';

export function DashboardMain({ initialLayoutId }: { initialLayoutId: string }) {
  const [layoutId] = useQueryState('layout', { defaultValue: initialLayoutId });
  const { layouts, syncWidgetsCount } = useDashboardStore();
  const [mounted, setMounted] = useState(false);

  // Check current layout data
  const currentLayout = layouts[layoutId] || DASHBOARD_TEMPLATES[layoutId] || DASHBOARD_TEMPLATES['single'];

  // Count number of slots and sync
  useEffect(() => {
    const countSlots = (node: LayoutNode): number => {
      if (node.type === 'widget') return 1;
      return node.widgets?.reduce((acc, child) => acc + (child ? countSlots(child) : 0), 0) || 0;
    };
    syncWidgetsCount(countSlots(currentLayout));
  }, [layoutId, currentLayout, syncWidgetsCount]);

  // Prevent hydration
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="h-full w-full overflow-hidden">
      <RecursiveLayout node={currentLayout} templateId={layoutId} />
    </div>
  );
}
