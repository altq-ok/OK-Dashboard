'use client';

import { useMemo } from 'react';
import { useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/useDashboardStore';
import { DASHBOARD_TEMPLATES } from '@/lib/layout-templates';
import { RecursiveLayout } from './recursive-layout';
import { LayoutNode } from '@/types/dashboard';

export function DashboardMain({ initialLayoutId }: { initialLayoutId: string }) {
  const [layoutId] = useQueryState('layout', { defaultValue: initialLayoutId });

  const layouts = useDashboardStore((state) => state.layouts);
  const syncWidgetsCount = useDashboardStore((state) => state.syncWidgetsCount);
  const [mounted, setMounted] = useState(false);

  const currentLayout = useMemo(() => {
    return layouts[layoutId] || DASHBOARD_TEMPLATES[layoutId] || DASHBOARD_TEMPLATES['single'];
  }, [layouts, layoutId]);

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
      <RecursiveLayout key={layoutId} node={currentLayout} templateId={layoutId} />
    </div>
  );
}
