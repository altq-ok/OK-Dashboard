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

import { useHello } from '@/hooks/use-hello';

export function WidgetSlot({ index }: { index: number }) {
  const widgetType = useDashboardStore((state) => state.activeWidgets[index]);
  const setWidget = useDashboardStore((state) => state.setWidget);

  const { data, isLoading, error } = useHello();

  return (
    <div className="h-full w-full p-2">
      {!widgetType ? (
        // Empty state
        <div className="flex h-full w-full items-center justify-center border-2 border-dashed rounded-xl bg-muted/30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Select Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setWidget(index, 'analytics')}>Analytics</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setWidget(index, 'userList')}>Calendar</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setWidget(index, 'logs')}>Validation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        // With widget
        <div className="flex flex-col h-full w-full p-4 border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="font-bold uppercase text-xs text-muted-foreground">{widgetType}</h3>
            <Button variant="ghost" size="sm" className="h-8" onClick={() => setWidget(index, null)}>
              Close
            </Button>
          </div>

          {/* Make scrollable when content exists, but fix header => flex-1 */}
          <div className="flex-1 text-sm overflow-auto">
            {isLoading && <p>Calling Python...</p>}
            {error && <p className="text-destructive">Error: {error.message}</p>}
            {data && (
              <div className="p-2 bg-primary/10 rounded border border-primary/20">
                🐍 Python says: <span className="font-bold">{data.message}</span>
              </div>
            )}
            {widgetType === 'analytics' && <div>Analytics Placeholder</div>}
            {widgetType === 'userList' && <div>Calendar Placeholder</div>}
            {widgetType === 'logs' && <div>Validation Placeholder</div>}
          </div>
        </div>
      )}
    </div>
  );
}
