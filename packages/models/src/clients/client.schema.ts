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

export const clientSchema = z.object({
  client_id: z.string(),
  title: z.string(),
  first_name: z.string(),
  last_name: z.string(),
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
  country_code: z.string().nullable(),
  contact_number: z
    .string()
    .regex(PHONE_REGEX, "Invalid phone number format")
    .nullable(),
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
    contact_id: z.string().nullable().optional(),
    user_id: z.string(),
    country_code: z.string().nullable().optional(),
    contact_number: z
      .string()
      .regex(PHONE_REGEX, "Invalid phone number format")
      .nullable()
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.contact_id && (!data.country_code || !data.contact_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Either contact_id or (country_code and contact_number) must be provided",
        path: ["contact_id"],
      });
    }
  });

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
            code: "custom",
          });
        }

        if (data.emergency_contact_number && !data.emergency_contact_name) {
          ctx.addIssue({
            path: ["emergency_contact_name"],
            message:
              "Emergency contact name is required when emergency contact number is provided",
            code: "custom",
          });
        }
      })
  );
};

export const createClientSchema = addClientValidations(createClientBaseSchema);

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
    contact_id: z.string().optional(),
    user_id: z.string().optional(),
  })
  .strict();

/* ---------------- TYPES (DERIVED) ---------------- */

export type Client = z.infer<typeof clientSchema>;

export type GetClientParam = z.infer<typeof getClientParamSchema>;
export type UpdateClientParam = z.infer<typeof updateClientParamSchema>;
export type GetAllClientsQuery = z.infer<typeof getAllClientsQuerySchema>;
export type GetClientByPhoneQuery = z.infer<typeof getClientByPhoneQuerySchema>;

export type CreateClientInput = z.infer<typeof createClientSchema>;
type RequireNonNull<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

export type CreateContactInfoInput = RequireNonNull<
  Pick<CreateClientInput, "country_code" | "contact_number">
>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export type ContactInfo = RequireNonNull<
  Pick<CreateClientInput, "contact_id" | "country_code" | "contact_number">
> & { created_date: string };

export type GenderType = z.infer<typeof genderEnum>;
