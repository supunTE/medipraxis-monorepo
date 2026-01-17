import { z } from "zod";

/* ---------------- REGEX VALIDATIONS ---------------- */

const PHONE_REGEX = /^[\d\s\+\-\(\)]+$/;

/* ---------------- ENUMS ---------------- */

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

export const genderEnum = z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]);

/* ---------------- RESPONSE SCHEMAS ---------------- */

export const contactInfoSchema = z.object({
  contact_id: z.string(),
  country_code: z.string(),
  contact_number: z.string(),
  created_date: z.string(),
});

export const clientSchema = z.object({
  client_id: z.string(),
  title: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  gender: genderEnum,
  date_of_birth: z.string(),
  emergency_contact_name: z.string().nullable(),
  emergency_contact_country_code: z.string().nullable(),
  emergency_contact_number: z.string().nullable(),
  emergency_contact_relationship: z.string().nullable(),
  known_conditions: z.array(z.string()).nullable(),
  note: z.string().nullable(),
  created_date: z.string(),
  modified_date: z.string().nullable(),
  deleted_date: z.string().nullable(),
  contact_id: z.string(),
  user_id: z.string(),
});

/* ---------------- REQUEST SCHEMAS ---------------- */

export const createContactInfoSchema = z
  .object({
    country_code: z.string(),
    contact_number: z
      .string()
      .regex(PHONE_REGEX, "Invalid phone number format"),
  })
  .strict();

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

const createClientBaseSchema = z
  .object({
    title: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    gender: genderEnum,
    date_of_birth: z.string(),
    emergency_contact_name: z.string().optional().nullable(),
    emergency_contact_country_code: z.string().optional().nullable(),
    emergency_contact_number: z
      .string()
      .regex(PHONE_REGEX, "Invalid emergency contact phone number format")
      .optional()
      .nullable(),
    emergency_contact_relationship: z.string().optional().nullable(),
    known_conditions: z.array(z.string()).optional().nullable(),
    note: z.string().optional().nullable(),
    contact_id: z.string(),
    user_id: z.string(),
  })
  .strict();

const addClientValidations = <T extends z.ZodTypeAny>(schema: T) => {
  return (
    schema
      // DOB validation
      .refine(
        (data: any) => {
          const dob = new Date(data.date_of_birth);
          const today = new Date();

          if (dob > today) return false;

          const age =
            (today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

          return age >= 0 && age <= 150;
        },
        {
          message: "Date of birth is invalid",
          path: ["date_of_birth"],
        }
      )
      // Emergency contact consistency
      .superRefine((data: any, ctx) => {
        if (data.emergency_contact_name && !data.emergency_contact_number) {
          ctx.addIssue({
            path: ["emergency_contact_number"],
            message:
              "Emergency contact number is required when emergency contact name is provided",
            code: z.ZodIssueCode.custom,
          });
        }

        if (data.emergency_contact_number && !data.emergency_contact_name) {
          ctx.addIssue({
            path: ["emergency_contact_name"],
            message:
              "Emergency contact name is required when emergency contact number is provided",
            code: z.ZodIssueCode.custom,
          });
        }
      })
  );
};

export const createClientSchema = addClientValidations(createClientBaseSchema);

export const createClientWithContactSchema = addClientValidations(
  createClientBaseSchema.extend({
    country_code: z.string(),
    contact_number: z
      .string()
      .regex(PHONE_REGEX, "Invalid phone number format"),
  })
);

export const getClientByPhoneQuerySchema = z.object({
  country_code: z.string(),
  contact_number: z.string().regex(PHONE_REGEX, "Invalid phone number format"),
});

export const updateClientSchema = z
  .object({
    title: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    gender: genderEnum.optional(),
    date_of_birth: z.string().optional(),
    emergency_contact_name: z.string().nullable().optional(),
    emergency_contact_country_code: z.string().nullable().optional(),
    emergency_contact_number: z
      .string()
      .regex(PHONE_REGEX, "Invalid emergency contact phone number format")
      .nullable()
      .optional(),
    emergency_contact_relationship: z.string().nullable().optional(),
    known_conditions: z.array(z.string()).nullable().optional(),
    note: z.string().nullable().optional(),
    contact_id: z.string(),
    user_id: z.string(),
  })
  .strict();

/* ---------------- TYPES (DERIVED) ---------------- */

export type Client = z.infer<typeof clientSchema>;
export type GetClientParam = z.infer<typeof getClientParamSchema>;
export type UpdateClientParam = z.infer<typeof updateClientParamSchema>;
export type GetAllClientsQuery = z.infer<typeof getAllClientsQuerySchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type GetClientByPhoneQuery = z.infer<typeof getClientByPhoneQuerySchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type CreateContactInfoInput = z.infer<typeof createContactInfoSchema>;
export type CreateClientWithContactInput = z.infer<
  typeof createClientWithContactSchema
>;
export type GenderType = z.infer<typeof genderEnum>;
