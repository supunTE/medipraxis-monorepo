import type { SupabaseClient } from "@supabase/supabase-js";

export const USER_QUERIES = {
  USER_TABLE: "app_user",
  USER_BASE: "*",
} as const;

export class UserRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async findUserById(userId: string) {
    const { data, error } = await this.db
      .from(USER_QUERIES.USER_TABLE)
      .select(USER_QUERIES.USER_BASE)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return data;
  }

  async updateUser(userId: string, updateData: any) {
    const { data, error } = await this.db
      .from(USER_QUERIES.USER_TABLE)
      .update({
        ...updateData,
        // modified_date will automatically be updated in supabase
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return data;
  }
}
