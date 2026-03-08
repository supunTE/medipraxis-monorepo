import { z } from "zod";

/* ---------------- ENUMS ---------------- */

export const TaskCreatorEnum = z.enum(["PRACTITIONER", "CLIENT"]);

export const TaskTypeEnum = z.enum(["APPOINTMENT", "REMINDER", "NOTE"]);

export const TaskStatusEnum = z.enum([
  "IN_PROGRESS",
  "CANCELLED",
  "NOT_STARTED",
  "COMPLETED",
]);

/* ---------------- RESPONSE SCHEMAS ---------------- */

export const taskSchema = z.object({
  task_id: z.string(),
  task_title: z.string(),
  task_type_id: z.string(),
  task_status_id: z.string(),
  client_id: z.string().nullable(),
  user_id: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  deleted_date: z.string().nullable(),
  created_date: z.string(),
  modified_date: z.string().nullable(),
  note: z.string().nullable(),
  set_alarm: z.boolean(),
  // appointment
  appointment_number: z.number().nullable(),
  slot_window_id: z.string().nullable(),
  created_by: TaskCreatorEnum,
});

/* ---------------- REQUEST SCHEMAS ---------------- */

export const getTaskParamSchema = z.object({
  id: z.string(),
});

export const updateTaskParamSchema = z.object({
  id: z.string(),
});

export const getAllTasksQuerySchema = z.object({
  user_id: z.string(),
  task_type: TaskTypeEnum.optional(),
  task_status: TaskStatusEnum.optional(),
  slot_window_id: z.string().optional(),
  date: z.string().optional(), // YYYY-MM-DD to filter tasks for a specific day
});

export const getAppointmentsByClientQuerySchema = z.object({
  client_id: z.string(),
  task_status: TaskStatusEnum.optional(),
  slot_window_id: z.string().optional(),
});

export const createTaskSchema = z.object({
  task_title: z.string(),
  user_id: z.string(),
  end_date: z.string(),
  task_type_id: z.string().optional(),
  task_status_id: z.string().optional(),
  client_id: z.string().optional(),
  start_date: z.string().optional(),
  note: z.string().optional(),
  set_alarm: z.boolean().optional(),
  // appointment
  appointment_number: z.number().optional(),
  slot_window_id: z.string().optional(),
  created_by: TaskCreatorEnum.optional(),
});

export const updateTaskSchema = z
  .object({
    task_title: z.string().optional(),
    task_type: TaskTypeEnum.optional(),
    task_status: TaskStatusEnum.optional(),
    client_id: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    note: z.string().optional(),
    set_alarm: z.boolean().optional(),
    // appointment
    appointment_number: z.number().optional(),
  })
  .strict();

export const reserveAppointmentByClientSchema = z
  .object({
    slot_window_id: z.string(),
    client_id: z.string(),
  })
  .strict();

export const cancelAppointmentByClientSchema = z
  .object({
    task_id: z.string(),
  })
  .strict();

/* ---------------- TYPES (DERIVED) ---------------- */

export type TaskCreator = z.infer<typeof TaskCreatorEnum>;
export type Task = z.infer<typeof taskSchema>;
export type GetTaskParam = z.infer<typeof getTaskParamSchema>;
export type UpdateTaskParam = z.infer<typeof updateTaskParamSchema>;
export type GetAllTaskQuery = z.infer<typeof getAllTasksQuerySchema>;
export type GetAppointmentsByClientQuery = z.infer<
  typeof getAppointmentsByClientQuerySchema
>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
// TODO: UpdateTaskInput & UpdateTaskData can be merged if we introduce enums to the tasks db table
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskData = Omit<UpdateTaskInput, "task_type" | "task_status"> & {
  task_type_id?: string;
  task_status_id?: string;
};
export type ReserveAppointmentByClientInput = z.infer<
  typeof reserveAppointmentByClientSchema
>;
export type CancelAppointmentByClientInput = z.infer<
  typeof cancelAppointmentByClientSchema
>;

/* Output-only type extending Task with related entity names */
export type TaskDetails = Task & {
  task_type_name: string;
  task_status_name: string;
  client_first_name: string | null;
  client_last_name: string | null;
};

/* Task type enum for categorizing tasks */
export enum TaskType {
  APPOINTMENT = "APPOINTMENT",
  REMINDER = "REMINDER",
  NOTE = "NOTE",
}

export enum TaskStatus {
  IN_PROGRESS = "IN_PROGRESS",
  CANCELLED = "CANCELLED",
  NOT_STARTED = "NOT_STARTED",
  COMPLETED = "COMPLETED",
}
