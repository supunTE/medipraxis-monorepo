import { z } from "zod";

/* ---------------- REQUEST SCHEMAS ---------------- */

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const aiQuerySchema = z.object({
  query: z.string().min(1, "Query is required"),
  history: z.array(chatMessageSchema).max(10).optional(),
});

/* ---------------- TYPES (DERIVED) ---------------- */

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type AIQueryInput = z.infer<typeof aiQuerySchema>;
