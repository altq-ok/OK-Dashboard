'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/store/useDashboardStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function WidgetSlot({ index }: { index: number }) {
  const widgetType = useDashboardStore((state) => state.activeWidgets[index]);
  const setWidget = useDashboardStore((state) => state.setWidget);

  if (!widgetType) {
    return (
      <div className="flex h-full items-center justify-center border-2 border-dashed m-2 rounded-xl bg-muted/30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Select Wiedget
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setWidget(index, 'analytics')}>Analytics</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setWidget(index, 'userList')}>Calendar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setWidget(index, 'logs')}>Validation</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 border rounded-xl bg-card shadow-sm m-2 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold uppercase text-xs text-muted-foreground">{widgetType}</h3>
        <Button variant="ghost" size="sm" onClick={() => setWidget(index, null)}>
          Close
        </Button>
      </div>
      <div className="text-sm">
        {widgetType === 'analytics' && <div>Analytics Placeholder</div>}
        {widgetType === 'userList' && <div>Calendar Placeholder</div>}
        {widgetType === 'logs' && <div>Validation Placeholder</div>}
      </div>
    </div>
  );
}
