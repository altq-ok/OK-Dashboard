'use client';

import { useQuery } from '@tanstack/react-query';
import { User, Clock, Loader2, Power, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkerControl } from '@/hooks/use-worker-control';
import { useAllStatuses } from '@/hooks/use-all-statuses';

export function GlobalTaskMonitor() {
  const { restartWorker, isRestarting } = useWorkerControl();

  // Monitor all tasks every 5 seconds
  const { data: tasks } = useAllStatuses();

  // Check if Worker is ready
  const { data: workerStatus } = useQuery({
    queryKey: ['system', 'worker-status'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/system/worker-status');
      return res.json();
    },
    refetchInterval: 3000,
  });

  const runningTasks = tasks?.filter((t) => t.status === 'running') || [];
  const isReady = workerStatus?.status === 'ready';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2 border-dashed">
          <div className={`h-2 w-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="hidden lg:inline">Task Monitor</span>
          {runningTasks.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-bold">
              {runningTasks.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center text-[10px] text-muted-foreground tracking-widest">
          LOCAL ENGINE
        </DropdownMenuLabel>

        {/* Local Engine Status Section */}
        <div className="p-3 bg-muted/30 mx-1 rounded-md mb-2 relative group">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {isReady ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
              )}
              <div className="flex flex-col">
                <span className="text-xs font-bold">{isReady ? 'Worker Ready' : 'Initializing Libraries...'}</span>
                <span className="text-[9px] font-mono text-muted-foreground">PID: {workerStatus?.pid || '----'}</span>
              </div>
            </div>

            {/* Button to restart Worker */}
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              disabled={isRestarting}
              onClick={(e) => {
                e.stopPropagation(); // Prevent dropdown from closing
                if (confirm('All tasks will be terminated. Do you want to restart Worker process?')) {
                  restartWorker();
                }
              }}
            >
              {isRestarting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex justify-between items-center text-[10px] text-muted-foreground tracking-widest">
          ACTIVITY LOG
          <Badge variant="outline" className="text-[9px] font-normal">
            {tasks?.length || 0}
          </Badge>
        </DropdownMenuLabel>

        <div className="max-h-64 overflow-y-auto pr-1">
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => {
              const displayId = `${task.params.target_id} / ${task.params.task_type.toUpperCase()}`;
              return (
                <DropdownMenuItem key={task.task_id} className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold font-mono truncate max-w-45">{displayId}</span>
                    <Badge
                      variant={
                        task.status === 'running' ? 'default' : task.status === 'failed' ? 'destructive' : 'secondary'
                      }
                      className="text-[9px] px-1.5 h-4"
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {task.user}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(task.last_heartbeat).toLocaleTimeString()}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">No recent activity</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
