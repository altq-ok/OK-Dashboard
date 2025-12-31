'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TaskParams } from '@/types/task';
import { useAllStatuses } from '@/hooks/use-all-statuses';

const API_BASE = 'http://localhost:8000'; // FastAPI's URL

export function useTask(targetId: string, taskType: string, version: string = 'latest') {
  const queryClient = useQueryClient();
  const prevStatusRef = useRef<string | undefined>(undefined);
  const isInitialLoad = useRef(true); // To prevent recurring toast
  const { data: allStatuses } = useAllStatuses();

  const status = useMemo(() => {
    if (!allStatuses) return undefined;

    const relevantRunning = allStatuses.find(
      (s) =>
        s.params.task_type === taskType &&
        s.status === 'running' &&
        (s.params.target_id === targetId || s.params.target_id === 'ALL'),
    );
    if (relevantRunning) return relevantRunning;

    return allStatuses
      .filter((s) => s.params.target_id === targetId && s.params.task_type === taskType)
      .sort((a, b) => new Date(b.last_heartbeat).getTime() - new Date(a.last_heartbeat).getTime())[0];
  }, [allStatuses, targetId, taskType]);

  // Get data when status = 'done' or a snapshot is specified
  const { data: result, isLoading: isDataLoading } = useQuery({
    queryKey: ['task', targetId, taskType, 'data', version],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/tasks/${targetId}/${taskType}/data?version=${version}`);
      if (!res.ok) throw new Error('Data fetch failed');
      const json = await res.json();
      return json.data;
    },
    // Always show the latest data if available
    enabled: !!targetId && !!taskType,
    // queryClient.invalidateQueries(...) is called on task completion, and
    // TanStack Query fetches data in the backgraound and updates UI once done
  });

  // Get snapshots
  const { data: snapshots = [] } = useQuery<string[]>({
    queryKey: ['task', targetId, taskType, 'snapshots'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/tasks/${targetId}/${taskType}/snapshots`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.snapshots; // backend should return List[str]
    },
    enabled: !!targetId && !!taskType,
  });

  // Execute task (triggered from Global Trigger)
  const { mutate: run, isPending: isStarting } = useMutation({
    mutationFn: async (extraParams: Record<string, any> = {}) => {
      const params: TaskParams = {
        target_id: targetId,
        task_type: taskType as any,
        extra_params: extraParams,
      };
      const res = await fetch(`${API_BASE}/run-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Execution failed');
      return res.json();
    },
    onSuccess: () => {
      toast.info(`Sent task request for ${taskType.toUpperCase()}`);
      // Reload status and start pollilng
      queryClient.invalidateQueries({ queryKey: ['task', targetId, taskType, 'status'] });
    },
    onError: (err) => toast.error(`Execution error: ${err.message}`),
  });

  // Toast notification
  useEffect(() => {
    if (!status) return;

    // On initial load, sync status only and don't show toast
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      prevStatusRef.current = status.status;
      return;
    }

    // show toast when status changes
    if (prevStatusRef.current !== status.status) {
      if (status.status === 'done') {
        toast.success(`${taskType} for ${targetId} completed`);
        // Update data to the latest
        queryClient.invalidateQueries({ queryKey: ['task', targetId, taskType, 'data'] });
      } else if (status.status === 'failed') {
        toast.error(`${targetId} failed to execute`, { description: status.message });
      }
      prevStatusRef.current = status.status;
    }
  }, [status, targetId, taskType, queryClient]);

  return {
    status, // status, message etc.
    result, // data parsed from Parquet
    snapshots,
    isDataLoading,
    run, // execution function
    isUpdating: isStarting || status?.status === 'running',
  };
}
