import { z } from "zod";

/* ---------------- SCHEMAS ---------------- */

export const userSchema = z.object({
  user_id: z.string().uuid(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  title: z.enum(["Dr.", "Mr.", "Mrs.", "Ms.", "Prof.", "Rev."]).nullable(),
  role: z.string().nullable(),
  registration_number: z.string().nullable(),
  specialization: z.string().nullable(),
  mobile_country_code: z.number().nullable(),
  mobile_number: z.string().nullable(),
  whatsapp_country_code: z.number().nullable(),
  whatsapp_number: z.string().nullable(),
  email_address: z.string().nullable(),
  photo_url: z.string().nullable(),
  seal_url: z.string().nullable(),
  created_date: z.string(),
  modified_date: z.string().nullable(),
  password_hash: z.string().nullable(),
});

export const getUserParamSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

export const updateUserParamSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

export const updateUserSchema = z
  .object({
    title: z.enum(["Dr.", "Mr.", "Mrs.", "Ms.", "Prof.", "Rev."]).optional(),
    role: z.string().min(1).max(100).optional(),
    registration_number: z.string().max(100).optional().nullable(),
    specialization: z.string().max(200).optional().nullable(),
    mobile_country_code: z.number().int().min(1).max(999).optional(),
    mobile_number: z
      .string()
      .regex(/^[0-9]{7,15}$/)
      .optional(),
    whatsapp_country_code: z
      .number()
      .int()
      .min(1)
      .max(999)
      .optional()
      .nullable(),
    whatsapp_number: z
      .string()
      .regex(/^[0-9]{7,15}$/)
      .optional()
      .nullable(),
    email_address: z.string().email().optional().nullable(),
    photo_url: z.string().url().optional().nullable(),
    seal_url: z.string().url().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/* ---------------- TYPES (DERIVED) ---------------- */

export type User = z.infer<typeof userSchema>;
export type GetUserParam = z.infer<typeof getUserParamSchema>;
export type UpdateUserParam = z.infer<typeof updateUserParamSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/* ---------------- RESPONSE TYPES ---------------- */

export type GetUserResponse = {
  success: true;
  user: User;
};

export type UpdateUserResponse = {
  success: true;
  user: User;
};

export type UserErrorResponse = {
  error: string;
};
