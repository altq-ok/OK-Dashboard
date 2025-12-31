'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, User, Clock, AlertCircle } from 'lucide-react';
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
import { TaskStatus } from '@/types/task';

export function GlobalTaskMonitor() {
  // Monitor all tasks every 5 seconds
  const { data: tasks } = useQuery<TaskStatus[]>({
    queryKey: ['tasks', 'global-status'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/tasks/status');
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 5000,
  });

  const runningTasks = tasks?.filter((t) => t.status === 'running') || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2 border-dashed">
          <Activity className={`h-4 w-4 ${runningTasks.length > 0 ? 'text-blue-500 animate-pulse' : ''}`} />
          <span className="hidden lg:inline">Team Tasks</span>
          {runningTasks.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white font-bold">
              {runningTasks.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          Team Activity
          <Badge variant="outline" className="text-[10px]">
            {tasks?.length || 0} Total
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-y-auto">
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <DropdownMenuItem key={task.task_id} className="flex flex-col items-start gap-1 p-3 focus:bg-muted/50">
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-bold font-mono truncate max-w-45">{task.task_id}</span>
                  <Badge
                    variant={
                      task.status === 'running' ? 'default' : task.status === 'failed' ? 'destructive' : 'secondary'
                    }
                    className="text-[9px] px-1.5 h-4"
                  >
                    {task.status.toUpperCase()}
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

                {task.status === 'running' && task.message && (
                  <p className="text-[10px] text-blue-500 italic mt-0.5 truncate w-full">{task.message}</p>
                )}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
              No task history in shared folder
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
