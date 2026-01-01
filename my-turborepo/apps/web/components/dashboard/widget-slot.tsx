'use client';

import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useDashboardParams } from '@/hooks/use-dashboard-params';
import { useTask } from '@/hooks/use-task';
import { WIDGET_REGISTRY, WIDGET_TASK_MAP } from '@/lib/widget-registry';
import { WidgetType } from '@/types/dashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function WidgetSlot({ index }: { index: number }) {
  const widgetType = useDashboardStore((state) => state.activeWidgets[index]);
  const setWidget = useDashboardStore((state) => state.setWidget);
  const widgetConfig = widgetType ? WIDGET_REGISTRY[widgetType] : null;

  const { targetId, versions } = useDashboardParams();

  // Get task type for each WidgetType
  const taskType = widgetType ? WIDGET_TASK_MAP[widgetType] : null;
  const version = taskType ? versions[taskType as keyof typeof versions] : 'latest';

  // set targetId = 'ALL' when widgetType = 'home'
  const effectiveTargetId = widgetType === 'home' ? 'ALL' : targetId;

  // Load task data
  const { status, result } = useTask(effectiveTargetId, taskType || '', version);

  if (!widgetType) {
    return (
      <div className="h-full w-full p-2">
        <div className="flex h-full w-full items-center justify-center border-2 border-dashed rounded-xl bg-muted/30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Open Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {Object.entries(WIDGET_REGISTRY).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <DropdownMenuItem key={key} onClick={() => setWidget(index, key as WidgetType)} className="gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{config.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  const isRunning = status?.status === 'running';
  const shouldDim = isRunning && !widgetConfig?.disableOpacityOnUpdate;

  return (
    <div className="h-full w-full p-2">
      <div className="flex flex-col h-full w-full p-4 border rounded-xl bg-card shadow-sm overflow-hidden relative">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold uppercase text-xs text-muted-foreground">{widgetType}</h3>
            {isRunning && (
              <span className="flex items-center gap-1 text-[10px] text-blue-500 font-medium animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                UPDATING...
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setWidget(index, null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Section */}
        <div
          className={`flex-1 text-sm overflow-auto transition-opacity duration-300 ${shouldDim ? 'opacity-50' : 'opacity-100'}`}
        >
          {widgetConfig && <widgetConfig.component data={result} status={status} targetId={effectiveTargetId} />}
        </div>
      </div>
    </div>
  );
}
