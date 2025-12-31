'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:8000'; /* FastAPI's URL */

export function useWorkerControl() {
  const { mutate: restartWorker, isPending: isRestarting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/stop-worker`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to restart worker');
      return res.json();
    },
    onSuccess: (data) => {
      toast.success('Worker Process Restarted', {
        description: `New PID: ${data.new_pid}. Initializing Worker...`,
        duration: 5000,
      });
    },
    onError: (err) => {
      toast.error('Worker Restart Failed', {
        description: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    },
  });

  return { restartWorker, isRestarting };
}
