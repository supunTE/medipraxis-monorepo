import { z } from "zod";

/* ---------------- RESPONSE SCHEMAS ---------------- */

export const requestReportSchema = z.object({
  request_report_id: z.string().uuid(),
  created_date: z.string(),
  user_id: z.string().uuid().nullable(),
  client_id: z.string().uuid().nullable(),
  form_id: z.string().uuid().nullable(),
  requested_reports: z.any().nullable(), // JSON field
  expired: z.boolean().nullable(),
  deleted: z.boolean().nullable(),
});

export const pendingReportSchema = z.object({
  request_report_id: z.string().uuid(),
  created_date: z.string(),
  client_id: z.string().uuid(),
  client_name: z.string(),
  user_id: z.string().uuid().nullable(),
  user_name: z.string().nullable(),
  requested_reports: z.any().nullable(),
  form_id: z.string().uuid().nullable(),
});

/* ---------------- QUERY SCHEMAS ---------------- */

export const getPendingReportsParamSchema = z.object({
  contact_id: z.string().uuid(),
});

/* ---------------- INPUT SCHEMAS ---------------- */

export const createRequestReportInputSchema = z.object({
  user_id: z.string().uuid(),
  client_id: z.string().uuid(),
  form_id: z.string().uuid().optional(),
  requested_reports: z.any().optional(),
  note: z.string().optional(),
  notification_type: z
    .object({
      whatsapp: z.boolean().optional(),
      text: z.boolean().optional(),
      email: z.boolean().optional(),
    })
    .optional(),
});

/* ---------------- TYPES ---------------- */

export type RequestReport = z.infer<typeof requestReportSchema>;
export type PendingReport = z.infer<typeof pendingReportSchema>;
export type GetPendingReportsParam = z.infer<
  typeof getPendingReportsParamSchema
>;
export type CreateRequestReportInput = z.infer<
  typeof createRequestReportInputSchema
>;
