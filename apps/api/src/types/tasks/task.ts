export interface Task {
  task_id: string;
  task_title: string;
  task_type_id: string;
  task_status_id: string;
  client_id: string | null;
  user_id: string;
  start_date: string;
  end_date: string;
  deleted_date: string | null;
  created_date: string;
  modified_date: string | null;
  note: string | null;
  set_alarm: boolean;

  // appointment
  appointment_number: number;
}

export interface TaskDetails extends Task {
  task_type_name: string;
  task_status_name: string;
  client_first_name: string | null;
  client_last_name: string | null;
}

export interface CreateTaskInput {
  task_title: string;
  user_id: string;
  end_date: string;
  task_type_id?: string;
  task_status_id?: string;
  client_id?: string;
  start_date?: string;
  note?: string;
  set_alarm?: boolean;

  // appointment
  appointment_number: number;
}

export interface UpdateTaskInput {
  task_title?: string;
  task_type_id?: string;
  task_status_id?: string;
  client_id?: string;
  start_date?: string;
  end_date?: string;
  note?: string;
  set_alarm?: boolean;

  // appointment
  appointment_number: number;
  user_id: string;
}
