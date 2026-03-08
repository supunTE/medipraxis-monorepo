import { z } from "zod";

export interface AppointmentRecord {
  appointment_record_id: string;
  user_id: string;
  client_id: string;
  appointment_id: string;
  form_id: string;
  appointment_data: Record<string, unknown> | null;
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
  appointment_data: z.record(z.string(), z.unknown()).optional().nullable(),
  note: z.string().optional().nullable(),
});

export const getAppointmentRecordQuerySchema = z.object({
  client_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
});

export const updateAppointmentRecordSchema = z.object({
  appointment_data: z.record(z.string(), z.unknown()).optional().nullable(),
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
