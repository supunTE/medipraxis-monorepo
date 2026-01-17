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

/* ---------------- TYPES ---------------- */

export type RequestReport = z.infer<typeof requestReportSchema>;
export type PendingReport = z.infer<typeof pendingReportSchema>;
export type GetPendingReportsParam = z.infer<
  typeof getPendingReportsParamSchema
>;
