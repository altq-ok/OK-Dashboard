'use client';

import React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { LayoutNode } from '@/types/dashboard';
import { WidgetSlot } from './widget-slot';
import { useDashboardStore } from '@/store/useDashboardStore';

interface Props {
  node: LayoutNode;
  templateId: string;
}

export function RecursiveLayout({ node, templateId }: Props) {
  const saveLayout = useDashboardStore((state) => state.saveLayout);

  // Save whole tree about resize
  const handleLayoutChange = (layout: Record<string, number>) => {
    if (node.type === 'group' && node.widgets) {
      const updatedNode: LayoutNode = {
        ...node,
        widgets: node.widgets.map((w) => ({
          ...w,
          // Search for new size with ID, if not found, keep size
          defaultSize: layout[w.id] ?? w.defaultSize,
        })),
      };
      saveLayout(templateId, updatedNode);
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
          <ResizablePanel defaultSize={child.defaultSize} id={child.id}>
            <RecursiveLayout node={child} templateId={templateId} />
          </ResizablePanel>
          {index < node.widgets!.length - 1 && <ResizableHandle withHandle />}
        </React.Fragment>
      ))}
    </ResizablePanelGroup>
  );
}
