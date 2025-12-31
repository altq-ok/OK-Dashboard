'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTask } from '@/hooks/use-task';
import { useDashboardParams, TaskType } from '@/hooks/use-dashboard-params';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  RefreshCw,
  History,
  Check,
  Database,
  ChevronDown,
  Loader2,
  Globe,
  ShieldAlert,
  Landmark,
  Settings2,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatSnapshotTimestamp } from '@/lib/utils';
import { TaskStatus } from '@/types/task';

export function DataControlCenter() {
  const { targetId, setVersion, versions } = useDashboardParams();

  // Task definitions - UI is automatically updated based on this map
  const taskDefinitions: { label: string; type: TaskType }[] = [
    { label: 'Pricing', type: 'pricing' },
    { label: 'Event', type: 'event' },
    { label: 'Guideline', type: 'guideline' },
  ];

  // All task monitoring
  const taskHooks = {
    pricing: useTask(targetId, 'pricing', versions.pricing),
    event: useTask(targetId, 'event', versions.event),
    guideline: useTask(targetId, 'guideline', versions.guideline),
  };

  // Manage extra parameters for tasks
  const [reloadParams, setReloadParams] = useState<string[]>([]);

  const handleUpdate = (type: keyof typeof taskHooks) => {
    const extraParams = {
      reload: reloadParams,
    };
    taskHooks[type].run({
      extra_params: extraParams,
    });
  };

  // Check if any task is pending or running
  const { data: allStatuses } = useQuery<TaskStatus[]>({ queryKey: ['tasks', 'global-status'] });
  const isAnyTaskRunning = allStatuses?.some((s) => s.status === 'running' || s.status == 'pending');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={isAnyTaskRunning ? 'default' : 'outline'}
          size="sm"
          className={`gap-2 transition-all duration-500 ${isAnyTaskRunning ? 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : ''}`}
        >
          {isAnyTaskRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          <span className="font-bold">Data Hub</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-2xl border-muted-foreground/20">
        <div className="p-4 bg-muted/30">
          <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
            <Database className="h-3 w-3" /> Data Management ({targetId})
          </h4>
        </div>
        <Separator />

        <div className="p-2 space-y-1">
          {taskDefinitions.map(({ label, type }) => {
            const task = taskHooks[type as keyof typeof taskHooks];
            const isRunning = task.status?.status === 'running';
            const currentVersion = versions[type];
            return (
              <div
                key={type}
                className={`flex items-center justify-between p-2 rounded-md transition-colors ${isRunning ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-muted/50'}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold">{label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {isRunning ? (
                      // Get message from Worker while running
                      <span className="text-blue-500 animate-pulse">{task.status?.message}</span>
                    ) : currentVersion === 'latest' ? (
                      // If latest is selected, show updated time of the snapshot
                      `Latest: ${formatSnapshotTimestamp(task.snapshots?.[0]) || 'No data'}`
                    ) : (
                      // For past snapshots, show its updated time
                      `Viewing: ${formatSnapshotTimestamp(currentVersion)}`
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Update Button */}
                  <Button
                    size="sm"
                    variant={isRunning ? 'ghost' : 'outline'}
                    className={`h-8 w-8 p-0 ${isRunning ? 'text-blue-500' : ''}`}
                    onClick={() => handleUpdate(type)}
                    disabled={isRunning}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                  </Button>

                  {/* History Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <History className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => setVersion(type, 'latest')} className="flex justify-between">
                        Latest Snapshot
                        {currentVersion === 'latest' && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                      <Separator className="my-1" />
                      <div className="max-h-40 overflow-y-auto">
                        {task.snapshots?.map((v: string) => (
                          <DropdownMenuItem
                            key={v}
                            onClick={() => setVersion(type, v)}
                            className="text-xs flex justify-between"
                          >
                            {v.replace('.parquet', '')}
                            {currentVersion === v && <Check className="h-4 w-4" />}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* --- Reload Params --- */}
        <div className="p-4 bg-muted/20 border-t space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <Settings2 className="h-3 w-3" /> Reload Options
            </h4>
            <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {reloadParams.length} selected
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'benchmark', label: 'Benchmark', icon: Globe, desc: 'Relative performance' },
              { id: 'risk', label: 'Risk Factors', icon: ShieldAlert, desc: 'Greeks and VaR' },
              { id: 'intl', label: 'Intl Markets', icon: Landmark, desc: 'Global correlation' },
              { id: 'raw', label: 'Raw Data', icon: Database, desc: 'Export source' },
            ].map((item) => {
              const isSelected = reloadParams.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setReloadParams((prev) =>
                      prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id],
                    );
                  }}
                  className={cn(
                    'relative flex flex-col items-start gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-left',
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] translate-y-[1px]'
                      : 'border-transparent bg-card hover:border-muted-foreground/20 shadow-sm',
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <item.icon className={cn('h-3.5 w-3.5', isSelected ? 'text-blue-500' : 'text-muted-foreground')} />
                    {isSelected && (
                      <Check className="h-3 w-3 text-blue-500 stroke-[3px] animate-in zoom-in duration-300" />
                    )}
                  </div>
                  <div>
                    <p
                      className={cn(
                        'text-[10px] font-bold',
                        isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-foreground',
                      )}
                    >
                      {item.label}
                    </p>
                    <p className="text-[9px] text-muted-foreground leading-tight">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
