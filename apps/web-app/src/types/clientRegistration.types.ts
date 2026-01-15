import { z } from "zod";

export const TITLE_OPTIONS = ["Mr", "Mrs", "Ms", "Dr", "Rev"] as const;
export const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"] as const;

export const clientRegistrationFormSchema = z.object({
  title: z.enum(TITLE_OPTIONS, {
    required_error: "Title is required",
  }),
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  gender: z.enum(GENDER_OPTIONS, {
    required_error: "Please select a gender",
  }),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  user_id: z.string(),
  contact_id: z.string(),
});

export type ClientRegistrationFormValues = z.infer<
  typeof clientRegistrationFormSchema
>;

export type ServerMessage = {
  type: "success" | "error";
  text: string;
};

export type ClientRegistrationProps = {
  onClose: () => void;
};
