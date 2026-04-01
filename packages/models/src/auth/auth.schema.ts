import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(1),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  mobile_number: z.string().min(1),
  mobile_country_code: z.string().min(1),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  mobile_number: z.string().min(1),
  mobile_country_code: z.string().min(1),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const registerAdditionalDetailsSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    profession: z.string().min(1, "Profession is required"),
    registration_number: z.string().min(1, "Registration number is required"),
    specialization: z.string().min(1, "Specialization is required"),
    mobile_country_code: z
      .string()
      .regex(/^\+?[0-9]{1,4}$/, "Invalid mobile country code"),
    mobile_number: z.string().regex(/^[0-9]{7,15}$/, "Invalid mobile number"),
    different_whatsapp_number: z.boolean(),
    whatsapp_country_code: z
      .string()
      .regex(/^\+?[0-9]{1,4}$/, "Invalid WhatsApp country code")
      .optional(),
    whatsapp_number: z
      .string()
      .regex(/^[0-9]{7,15}$/, "Invalid WhatsApp number")
      .optional(),
    email_address: z.string().email("Invalid email address").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.different_whatsapp_number) {
      if (!data.whatsapp_country_code) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["whatsapp_country_code"],
          message: "WhatsApp country code is required",
        });
      }
      if (!data.whatsapp_number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["whatsapp_number"],
          message: "WhatsApp number is required",
        });
      }
    }
  });

/* ---------------- TYPES (DERIVED) ---------------- */

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type RegisterAdditionalDetailsInput = z.infer<
  typeof registerAdditionalDetailsSchema
>;

/* ---------------- FORM SCHEMAS (MOBILE/WEB) ---------------- */

/**
 * Common phone validation logic
 */
export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^\d{7,15}$/, "Invalid phone number format (7-15 digits)");

/**
 * Login form validation schema
 */
export const loginFormSchema = z.object({
  countryCode: z.string().min(1, "Code is required"),
  phoneNumber: phoneSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

/**
 * Registration form validation schema
 */
export const registerFormSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    countryCode: z.string().min(1, "Code is required"),
    phoneNumber: phoneSchema,
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    agreed: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerFormSchema>;
