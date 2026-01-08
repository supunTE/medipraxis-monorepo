import { z } from "zod";

/* ---------------- RESPONSE SCHEMAS ---------------- */

export const clientSchema = z.object({
  client_id: z.string(),
  title: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  date_of_birth: z.string(),
  phone: z.string(),
  emergency_contact_name: z.string().nullable(),
  emergency_contact_phone: z.string().nullable(),
  emergency_contact_relationship: z.string().nullable(),
  known_conditions: z.string().nullable(),
  note: z.string().nullable(),
  created_date: z.string(),
  modified_date: z.string().nullable(),
  deleted_date: z.string().nullable(),
  user_id: z.string(),
});

/* ---------------- REQUEST SCHEMAS ---------------- */

export const getClientParamSchema = z.object({
  id: z.string(),
});

export const updateClientParamSchema = z.object({
  id: z.string(),
});

export const deleteClientParamSchema = z.object({
  id: z.string(),
});

export const getAllClientsQuerySchema = z.object({
  user_id: z.string(),
});

export const createClientSchema = z.object({
  title: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  date_of_birth: z.string(),
  phone: z.string(),
  emergency_contact_name: z.string().nullable(),
  emergency_contact_phone: z.string().nullable(),
  emergency_contact_relationship: z.string().nullable(),
  known_conditions: z.string().nullable(),
  note: z.string().nullable(),
  user_id: z.string(),
});

export const updateClientSchema = z.object({
  title: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  date_of_birth: z.string().optional(),
  phone: z.string().optional(),
  emergency_contact_name: z.string().nullable().optional(),
  emergency_contact_phone: z.string().nullable().optional(),
  emergency_contact_relationship: z.string().nullable().optional(),
  known_conditions: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  user_id: z.string().optional(),
});

/* ---------------- TYPES (DERIVED) ---------------- */

export type Client = z.infer<typeof clientSchema>;
export type GetClientParam = z.infer<typeof getClientParamSchema>;
export type UpdateClientParam = z.infer<typeof updateClientParamSchema>;
export type GetAllClientsQuery = z.infer<typeof getAllClientsQuerySchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
