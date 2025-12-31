'use client';

import { useTask } from '@/hooks/use-task';
import { useDashboardParams, TaskType } from '@/hooks/use-dashboard-params';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { RefreshCw, History, Check } from 'lucide-react';

export function DataControlCenter() {
  const { targetId, setVersion, versions } = useDashboardParams();

  const pricingTask = useTask(targetId, 'pricing', versions.pricing);
  const eventTask = useTask(targetId, 'event', versions.event);
  const guidelineTask = useTask(targetId, 'guideline', versions.guideline);

  const controls: { label: string; type: TaskType; task: any }[] = [
    { label: 'Pricing', type: 'pricing', task: pricingTask },
    { label: 'Event', type: 'event', task: eventTask },
    { label: 'Guideline', type: 'guideline', task: guidelineTask },
  ];

  return (
    <div className="flex items-center gap-4 border-l pl-4">
      {controls.map(({ label, type, task }) => {
        const isRunning = task.status?.status === 'running';
        const currentVersion = versions[type];

        return (
          <div key={type} className="flex items-center gap-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">{label}</span>

                {/* Run Button: Change colour while task is running and show Spinner */}
                <Button
                  size="sm"
                  variant={isRunning ? 'default' : 'outline'} // Set colour when running
                  className={`h-8 px-3 ${isRunning ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={() => task.run()} // Adjust args like { force: true } if needed
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                  {isRunning ? 'Running...' : 'Update'}
                </Button>

                {/* Snapshot Dropdown: use map to expand snapshots */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <History className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Snapshots</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Latest Option */}
                    <DropdownMenuItem onClick={() => setVersion(type, 'latest')} className="flex justify-between">
                      Latest Snapshot
                      {currentVersion === 'latest' && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Past Versions from Backend */}
                    <div className="max-h-50 overflow-y-auto">
                      {task.snapshots?.length > 0 ? (
                        task.snapshots.map((v: string) => (
                          <DropdownMenuItem
                            key={v}
                            onClick={() => setVersion(type, v)}
                            className="text-xs flex justify-between"
                          >
                            {v.replace('.parquet', '')}
                            {currentVersion === v && <Check className="h-4 w-4" />}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-2 text-[10px] text-center text-muted-foreground">No snapshot available</div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
