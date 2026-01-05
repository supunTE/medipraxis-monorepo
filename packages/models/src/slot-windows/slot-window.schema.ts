import { z } from "zod";

/* ---------------- ENUMS ---------------- */

export const DayOfWeekEnum = z.enum([
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]);

/* ---------------- RESPONSE SCHEMAS ---------------- */

export const slotWindowTemplateSchema = z.object({
  slot_window_template_id: z.string(),
  user_id: z.string(),
  day_of_week: z.array(DayOfWeekEnum),
  start_time: z.string(), // time format: "HH:MM:SS"
  end_time: z.string(), // time format: "HH:MM:SS"
  total_slots: z.number().int().positive(),
  slot_duration: z.number().int().positive(), // in seconds
  is_active: z.boolean(),
  end_date: z.string().nullable(), // date format: "YYYY-MM-DD"
  note: z.string().nullable(),
  location: z.string().nullable(),
  created_date: z.string(),
  modified_date: z.string(),
  deleted_date: z.string().nullable(),
});

export const slotWindowSchema = z.object({
  slot_window_id: z.string(),
  template_id: z.string().nullable(),
  user_id: z.string(),
  start_date: z.string(), // timestamptz
  end_date: z.string(), // timestamptz
  total_slots: z.number().int().positive(),
  slots_filled: z.number().int().min(0),
  task_status_id: z.string(),
  is_override: z.boolean(),
  note: z.string().nullable(),
  location: z.string().nullable(),
  created_date: z.string(),
  modified_date: z.string(),
});

/* ---------------- REQUEST SCHEMAS ---------------- */

export const createSlotWindowTemplateSchema = z
  .object({
    user_id: z.string(),
    day_of_week: z.array(DayOfWeekEnum),
    start_time: z.string(), // HH:MM:SS format
    end_time: z.string(), // HH:MM:SS format
    total_slots: z.number().int().positive(),
    end_date: z.string().optional(),
    note: z.string().optional(),
    location: z.string().optional(),
  })
  .strict();

export const updateSlotWindowTemplateSchema = z
  .object({
    day_of_week: z.array(DayOfWeekEnum).optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    total_slots: z.number().int().positive().optional(),
    end_date: z.string().optional(),
    note: z.string().optional(),
    location: z.string().optional(),
  })
  .strict();

export const createSlotWindowSchema = z
  .object({
    template_id: z.string().optional(),
    user_id: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    total_slots: z.number().int().positive(),
    slots_filled: z.number().int().min(0).optional(),
    is_override: z.boolean().optional(),
    note: z.string().optional(),
    location: z.string().optional(),
  })
  .strict();

export const updateSlotWindowSchema = z
  .object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    total_slots: z.number().int().positive().optional(),
    task_status_id: z.string().optional(),
    note: z.string().optional(),
    location: z.string().optional(),
  })
  .strict();

export const findAvailableSlotWindowsQuerySchema = z.object({
  user_id: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
});

/* ---------------- TYPES (DERIVED) ---------------- */

export type DayOfWeek = z.infer<typeof DayOfWeekEnum>;
export type SlotWindowTemplate = z.infer<typeof slotWindowTemplateSchema>;
export type SlotWindow = z.infer<typeof slotWindowSchema>;
export type SlotWindowForClient = Omit<
  SlotWindow,
  "created_date" | "modified_date" | "is_override"
>;
export type CreateSlotWindowTemplateInput = z.infer<
  typeof createSlotWindowTemplateSchema
>;
export type UpdateSlotWindowTemplateInput = z.infer<
  typeof updateSlotWindowTemplateSchema
>;
export type CreateSlotWindowInput = z.infer<typeof createSlotWindowSchema>;
export type UpdateSlotWindowInput = z.infer<typeof updateSlotWindowSchema>;
export type FindAvailableSlotWindowsQuery = z.infer<
  typeof findAvailableSlotWindowsQuerySchema
>;
