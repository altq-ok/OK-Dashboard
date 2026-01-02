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

export interface UserEvent {
  event_id: string;
  title: string;
  start: string; // YYYY-MM-DD
  start_time?: string; // HH:mm
  end?: string; // YYYY-MM-DD
  end_time?: string; // HH:mm
  description?: string;
  category?: string;
  user: string;
}
