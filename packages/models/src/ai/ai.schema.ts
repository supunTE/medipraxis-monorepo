import { z } from "zod";

/* ---------------- REQUEST SCHEMAS ---------------- */

export const aiQuerySchema = z.object({
  query: z.string().min(1, "Query is required"),
});

/* ---------------- TYPES (DERIVED) ---------------- */

export type AIQueryInput = z.infer<typeof aiQuerySchema>;
