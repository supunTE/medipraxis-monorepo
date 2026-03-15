import { z } from "zod";

/* ---------------- RESPONSE SCHEMAS ---------------- */

export const clientReportSchema = z.object({
  report_id: z.string(),
  report_title: z.string().nullable(),
  file_path: z.string().nullable(),
  file_type: z.string().nullable(),
  client_id: z.string().nullable(),
  user_id: z.string().nullable(),
  request_report_id: z.string().nullable(),
  expiry_date: z.string().nullable(),
  created_date: z.string(),
});

/* ---------------- REQUEST SCHEMAS ---------------- */

export const createClientReportSchema = z
  .object({
    client_id: z.string().uuid("Invalid client ID"),
    user_id: z.string().uuid("Invalid user ID"),
    request_report_id: z.string().uuid("Invalid request report ID"),
    expiry_date: z.string().optional(),
    reports: z
      .array(
        z.object({
          report_title: z.string().min(1, "Report title is required"),
        })
      )
      .min(1, "At least one report is required"),
  })
  .strict();

/* ---------------- TYPE EXPORTS ---------------- */

export type ClientReport = z.infer<typeof clientReportSchema>;
export type CreateClientReportInput = z.infer<typeof createClientReportSchema>;

export const reportItemSchema = z.object({
  report_id: z.string(),
  report_title: z.string().nullable(),
  file_path: z.string().nullable(),
  file_type: z.string().nullable(),
});

export const groupedPendingReportSchema = z.object({
  group_id: z.string(),
  client_id: z.string(),
  client_first_name: z.string(),
  client_last_name: z.string(),
  report_date: z.string(),
  request_report_id: z.string(),
  reports: z.array(reportItemSchema),
});

export const groupedCompletedReportSchema = z.object({
  group_id: z.string(),
  client_id: z.string(),
  client_first_name: z.string(),
  client_last_name: z.string(),
  report_date: z.string(),
  request_report_id: z.string().nullable(),
  reports: z.array(reportItemSchema),
});

export type ReportItem = z.infer<typeof reportItemSchema>;
export type GroupedPendingReport = z.infer<typeof groupedPendingReportSchema>;
export type GroupedCompletedReport = z.infer<
  typeof groupedCompletedReportSchema
>;

export interface GroupedClientReport {
  group_id: string;
  client_id: string;
  client_first_name: string;
  client_last_name: string;
  report_date: string;
  request_report_id: string | null;
  reports: Array<{
    report_id: string;
    report_title: string | null;
    file_path: string | null;
    file_type: string | null;
  }>;
}
