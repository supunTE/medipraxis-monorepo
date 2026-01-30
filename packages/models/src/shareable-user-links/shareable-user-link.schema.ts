import { z } from "zod";

/* ---------------- RESPONSE SCHEMAS ---------------- */

export const shareableUserLinkSchema = z.object({
  shareable_user_link_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  created_date: z.string(),
  deleted: z.boolean(),
});

/* ---------------- TYPES ---------------- */

export type ShareableUserLink = z.infer<typeof shareableUserLinkSchema>;
