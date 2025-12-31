/**
 * Mirror of the Pydantic schemas
 */
export interface TaskParams {
  target_id: string;
  task_type: 'event' | 'guideline' | 'pricing';
  extra_params: Record<string, any>;
}

export interface TaskStatus {
  task_id: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  user: string;
  progress: number;
  message: string;
  last_heartbeat: string; // ISO format string from JSON
  params: TaskParams;
}
