'use client';

import { useQuery } from '@tanstack/react-query';
import { TaskStatus } from '@/types/task';

export function useAllStatuses() {
  return useQuery<TaskStatus[]>({
    queryKey: ['tasks', 'global-status'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/tasks/status');
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 5000,
  });
}
