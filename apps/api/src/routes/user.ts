import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { UserController } from "../controllers";

const getUserParamSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

// SCHEMA for update user
const updateUserSchema = z
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

const users = new Hono()
  // Get user by ID
  .get(
    "/:id",
    zValidator("param", getUserParamSchema),
    UserController.getUserById
  )
  // Update user by ID
  .put(
    "/:id",
    zValidator("param", getUserParamSchema),
    zValidator("json", updateUserSchema),
    UserController.updateUser
  );

export default users;
