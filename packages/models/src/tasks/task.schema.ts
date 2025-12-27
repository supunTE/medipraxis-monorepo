import { z } from "zod";

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
});

export const updateTaskSchema = z.object({
  task_title: z.string().optional(),
  task_type_id: z.string().optional(),
  task_status_id: z.string().optional(),
  client_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  note: z.string().optional(),
  set_alarm: z.boolean().optional(),
});

/* ---------------- TYPES (DERIVED) ---------------- */

export type Task = z.infer<typeof taskSchema>;
export type GetTaskParam = z.infer<typeof getTaskParamSchema>;
export type UpdateTaskParam = z.infer<typeof updateTaskParamSchema>;
export type GetAllTaskQuery = z.infer<typeof getAllTasksQuerySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
