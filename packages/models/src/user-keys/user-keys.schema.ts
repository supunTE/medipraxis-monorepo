import { z } from "zod";

export const saveUserKeysSchema = z.object({
  public_key: z.string().min(1),
  wrapped_private_key: z.string().min(1),
  pbkdf2_salt: z.string().min(1),
});

export type SaveUserKeysInput = z.infer<typeof saveUserKeysSchema>;

export type UserKeys = {
  id: string;
  user_id: string;
  public_key: string;
  wrapped_private_key: string;
  pbkdf2_salt: string;
  created_at: string;
  updated_at: string;
};
