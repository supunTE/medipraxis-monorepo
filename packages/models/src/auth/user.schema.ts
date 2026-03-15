import { z } from "zod";

/* ---------------- RESPONSE SCHEMAS ---------------- */

export const userSchema = z.object({
  user_id: z.string(),
  username: z.string(),
  mobile_number: z.string(),
  mobile_country_code: z.string(),
  password_hash: z.string(),
  created_date: z.string().optional(),
  modified_date: z.string().nullable().optional(),
});

/* ---------------- REQUEST SCHEMAS ---------------- */

export const createUserSchema = z.object({
  mobile_number: z.string().min(1),
  mobile_country_code: z.string().min(1),
  password_hash: z.string(),
  username: z.string().min(1),
});

/* ---------------- TYPES (DERIVED) ---------------- */

export type User = z.infer<typeof userSchema>;
export type CreateUserPayload = z.infer<typeof createUserSchema>;
