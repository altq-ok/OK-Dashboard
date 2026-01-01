'use client';

import { useTask } from '@/hooks/use-task';
import { SUPPORTED_TASKS } from '@/lib/widget-registry';

/**
 * Manage all Task Hook
 * Thus, you don't need to call useTask in each component
 */

export function useTaskCollection(targetId: string) {
  // Hook needs to be called at top-level
  const pricing = useTask(targetId, 'pricing');
  const event = useTask(targetId, 'event');
  const guideline = useTask(targetId, 'guideline');

  const taskMap = { pricing, event, guideline };

  // Merge SUPPORTED_TASKS with Hook for UI loop
  const tasks = SUPPORTED_TASKS.map((config) => ({
    ...config,
    task: taskMap[config.id],
  }));

  const isAnyTaskRunning = tasks.some(
    (t) => t.task.status?.status === 'running' || t.task.status?.status === 'pending',
  );

  return { tasks, isAnyTaskRunning };
}
