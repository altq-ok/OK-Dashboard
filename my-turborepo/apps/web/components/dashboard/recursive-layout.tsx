'use client';

import React, { useMemo } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { LayoutNode } from '@/types/dashboard';
import { WidgetSlot } from './widget-slot';
import { useDashboardStore } from '@/store/useDashboardStore';

function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, ms);
  };
}

interface Props {
  node: LayoutNode;
  templateId: string;
}

export function RecursiveLayout({ node, templateId }: Props) {
  const updateLayoutSize = useDashboardStore((state) => state.updateLayoutSize);

  // Save state only after 300ms pause using debounce
  const debouncedSave = useMemo(
    () =>
      debounce((groupId: string, sizes: Record<string, number>) => {
        updateLayoutSize(templateId, groupId, sizes);
      }, 300),
    [templateId, updateLayoutSize],
  );

  const handleLayoutChange = (sizes: Record<string, number>) => {
    if (node.type === 'group' && node.widgets) {
      debouncedSave(node.id, sizes);
    }
  };

  if (node.type === 'widget') {
    return <WidgetSlot index={node.slotIndex ?? 0} />;
  }

  return (
    <ResizablePanelGroup
      orientation={node.direction === 'vertical' ? 'vertical' : 'horizontal'}
      onLayoutChange={handleLayoutChange}
      className="h-full w-full"
    >
      {node.widgets?.map((child, index) => (
        <React.Fragment key={child.id}>
          <ResizablePanel
            defaultSize={child.defaultSize}
            id={child.id}
            minSize={10} // prevent complete collapse
          >
            <RecursiveLayout node={child} templateId={templateId} />
          </ResizablePanel>
          {index < node.widgets!.length - 1 && <ResizableHandle withHandle />}
        </React.Fragment>
      ))}
    </ResizablePanelGroup>
  );
}
