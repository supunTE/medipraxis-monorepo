import { z } from "zod";

const PHONE_REGEX = /^[\d\s\+\-\(\)]+$/;

/* ---------------- REQUEST SCHEMAS ---------------- */

export const sendOtpSchema = z
  .object({
    country_code: z.string(),
    contact_number: z
      .string()
      .regex(PHONE_REGEX, "Invalid phone number format"),
  })
  .strict();

export const verifyOtpSchema = z
  .object({
    country_code: z.string(),
    contact_number: z
      .string()
      .regex(PHONE_REGEX, "Invalid phone number format"),
    otp: z.string().length(5, "OTP must be 5 digits"),
  })
  .strict();

/* ---------------- TYPE EXPORTS ---------------- */

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
