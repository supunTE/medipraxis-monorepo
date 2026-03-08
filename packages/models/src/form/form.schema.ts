import { z } from "zod";

export enum FormType {
  REQUEST_FORM = "REQUEST_FORM",
}

export interface Form {
  form_id: string;
  title: string;
  description: string | null;
  version: number;
  is_active: boolean;
  form_configuration: Record<string, unknown>[]; // JSONB array
  user_id: string;
  form_type: string;
  created_date: string;
  updated_date: string;
}

export const formFieldSchema = z.object({
  id: z.string().uuid(),
  active: z.boolean(),
  sequence: z.number(),
  help_text: z.string(),
  field_type: z.string(),
  description: z.string(),
  display_label: z.string(),
  options: z.array(z.string()).optional(),
});

export const createFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
  form_configuration: z.array(formFieldSchema),
  user_id: z.string().uuid(),
  form_type: z.nativeEnum(FormType),
});

export const getFormQuerySchema = z.object({
  user_id: z.string().uuid(),
  form_type: z.nativeEnum(FormType).optional(),
});

export const getFormParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type GetFormQuery = z.infer<typeof getFormQuerySchema>;
export type GetFormParam = z.infer<typeof getFormParamSchema>;
