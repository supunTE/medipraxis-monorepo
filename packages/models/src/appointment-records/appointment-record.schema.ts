import { z } from "zod";

export const appointmentFieldDataSchema = z.object({
  active: z.boolean(),
  required: z.boolean(),
  sequence: z.number(),
  help_text: z.string(),
  shareable: z.boolean(),
  field_type: z.string(),
  description: z.string(),
  display_label: z.string(),
  data: z.string(),
});

export interface AppointmentRecord {
  appointment_record_id: string;
  user_id: string;
  client_id: string;
  appointment_id: string;
  form_id: string;
  appointment_data: Array<{
    active: boolean;
    required: boolean;
    sequence: number;
    help_text: string;
    shareable: boolean;
    field_type: string;
    description: string;
    display_label: string;
    data: string;
  }> | null;
  note: string | null;
  created_date: string;
  updated_date: string;
  deleted: boolean;
}

export const createAppointmentRecordSchema = z.object({
  user_id: z.string().uuid(),
  client_id: z.string().uuid(),
  appointment_id: z.string().uuid(),
  form_id: z.string().uuid(),
  appointment_data: z.array(appointmentFieldDataSchema).optional().nullable(),
  note: z.string().optional().nullable(),
});

export const getAppointmentRecordQuerySchema = z.object({
  client_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
});

export const updateAppointmentRecordSchema = z.object({
  appointment_data: z.array(appointmentFieldDataSchema).optional().nullable(),
  note: z.string().optional().nullable(),
});

export const getAppointmentRecordParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateAppointmentRecordInput = z.infer<
  typeof createAppointmentRecordSchema
>;
export type GetAppointmentRecordQuery = z.infer<
  typeof getAppointmentRecordQuerySchema
>;
export type UpdateAppointmentRecordInput = z.infer<
  typeof updateAppointmentRecordSchema
>;
export type GetAppointmentRecordParam = z.infer<
  typeof getAppointmentRecordParamSchema
>;
