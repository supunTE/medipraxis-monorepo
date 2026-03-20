import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserKeys } from "@repo/models";

const USER_KEYS_TABLE = "app_user_keys";

export class UserKeysRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async findByUserId(userId: string): Promise<UserKeys | null> {
    const { data, error } = await this.db
      .from(USER_KEYS_TABLE)
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to find user keys: ${error.message}`);
    }

    return (data as UserKeys) ?? null;
  }

  async upsert(
    userId: string,
    publicKey: string,
    wrappedPrivateKey: string,
    pbkdf2Salt: string
  ): Promise<UserKeys> {
    const { data, error } = await this.db
      .from(USER_KEYS_TABLE)
      .upsert(
        {
          user_id: userId,
          public_key: publicKey,
          wrapped_private_key: wrappedPrivateKey,
          pbkdf2_salt: pbkdf2Salt,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save user keys: ${error.message}`);
    }

    return data as UserKeys;
  }
}
