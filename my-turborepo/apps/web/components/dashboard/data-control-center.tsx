'use client';

import { useState } from 'react';
import { useDashboardParams } from '@/hooks/use-dashboard-params';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  RefreshCw,
  Check,
  Database,
  ChevronDown,
  Loader2,
  Globe,
  ShieldAlert,
  Landmark,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTaskCollection } from '@/hooks/use-task-collection';

export function DataControlCenter() {
  const { targetId } = useDashboardParams();
  const { tasks, isAnyTaskRunning } = useTaskCollection(targetId);

  // Manage extra parameters for tasks
  const [reloadParams, setReloadParams] = useState<string[]>([]);

  const handleUpdate = (runFn: (extra: any) => void) => {
    runFn({ reload: reloadParams });
  };

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
          {tasks.map(({ id, label, task }) => {
            const isRunning = task.status?.status === 'running';
            return (
              <div
                key={id}
                className={`flex items-center justify-between p-2 rounded-md transition-colors ${isRunning ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-muted/50'}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold">{label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {isRunning ? (
                      <span className="text-blue-500 animate-pulse font-medium">{task.status?.message}</span>
                    ) : (
                      'Ready to update'
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Update Button */}
                  <Button
                    size="sm"
                    variant={isRunning ? 'ghost' : 'outline'}
                    className={`h-8 w-8 p-0 ${isRunning ? 'text-blue-500' : ''}`}
                    onClick={() => handleUpdate(task.run)}
                    disabled={isRunning}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                  </Button>
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
            {/* id will be passed as value of extraParams */}
            {[
              { id: 'bbg', label: 'Bloomberg', icon: Globe, desc: 'Market data' },
              { id: 'oms', label: 'OMS', icon: ShieldAlert, desc: 'Positions' },
              { id: 'odbc', label: 'ODBC', icon: Database, desc: 'Positions' },
              { id: 'db', label: 'Database', icon: Landmark, desc: 'Internal database' },
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
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] translate-y-px'
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
