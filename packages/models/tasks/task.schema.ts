import { z } from 'zod'

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
})

export const taskDetailsSchema = taskSchema.extend({
  task_type_name: z.string(),
  task_status_name: z.string(),
  client_first_name: z.string().nullable(),
  client_last_name: z.string().nullable(),
})

/* ---------------- REQUEST SCHEMAS ---------------- */

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
})

export const updateTaskSchema = z.object({
  task_title: z.string().optional(),
  task_type_id: z.string().optional(),
  task_status_id: z.string().optional(),
  client_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  note: z.string().optional(),
  set_alarm: z.boolean().optional(),
})

/* ---------------- TYPES (DERIVED) ---------------- */

export type Task = z.infer<typeof taskSchema>
export type TaskDetails = z.infer<typeof taskDetailsSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
