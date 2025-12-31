import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { TaskStatus } from '@/types/task';
import { toast } from 'sonner';

export function useTask(targetId: string, taskType: string) {
  // To prevent duplicates of toast
  const prevStatusRef = useRef<string | undefined>(undefined);

  // Polling of status
  const { data: status, refetch: refetchStatus } = useQuery<TaskStatus>({
    queryKey: ['status', targetId, taskType],
    queryFn: async () => {
      const res = await fetch(`http://localhost:8000/tasks/${targetId}/${taskType}/status`);
      if (!res.ok) throw new Error('Status fetch failed');
      return res.json();
    },
    // Reload every 2 seconds while status = 'running' or 'pending'
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === 'running' || s === 'pending' ? 2000 : false;
    },
  });

  // Get data (only enabled when status = 'done')
  const { data: result, isLoading: isDataLoading } = useQuery({
    queryKey: ['data', targetId, taskType],
    queryFn: async () => {
      const res = await fetch(`http://localhost:8000/tasks/${targetId}/${taskType}/data`);
      const json = await res.json();
      return json.data;
    },
    enabled: status?.status === 'done',
  });

  return { status, result, isDataLoading, refetchStatus };
}
