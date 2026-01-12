import { z } from "zod";

/* ---------------- RESPONSE SCHEMAS ---------------- */

export const clientReportSchema = z.object({
  report_id: z.string(),
  report_title: z.string().nullable(),
  file_path: z.string().nullable(),
  client_id: z.string().nullable(),
  user_id: z.string().nullable(),
  created_date: z.string(),
});

/* ---------------- REQUEST SCHEMAS ---------------- */

export const createClientReportSchema = z
  .object({
    report_title: z.string().min(1, "Report title is required"),
    client_id: z.string().uuid("Invalid client ID"),
    user_id: z.string().uuid("Invalid user ID"),
  })
  .strict();

/* ---------------- TYPE EXPORTS ---------------- */

export type ClientReport = z.infer<typeof clientReportSchema>;
export type CreateClientReportInput = z.infer<typeof createClientReportSchema>;
