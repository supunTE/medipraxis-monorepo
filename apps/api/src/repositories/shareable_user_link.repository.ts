import type { ShareableUserLink } from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export const SHAREABLE_USER_LINK_QUERIES = {
  SHAREABLE_USER_LINK_TABLE: "shareable_user_link",
  SHAREABLE_USER_LINK_ID: "shareable_user_link_id",
  USER_ID: "user_id",
  CREATED_DATE: "created_date",
  DELETED: "deleted",
} as const;

export class ShareableUserLinkRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async findByUserId(userId: string): Promise<ShareableUserLink | null> {
    const { data, error } = await this.db
      .from(SHAREABLE_USER_LINK_QUERIES.SHAREABLE_USER_LINK_TABLE)
      .select("*")
      .eq(SHAREABLE_USER_LINK_QUERIES.USER_ID, userId)
      .eq(SHAREABLE_USER_LINK_QUERIES.DELETED, false)
      .single();

    if (error) {
      throw new Error(`Failed to fetch shareable user link: ${error.message}`);
    }

    return data as ShareableUserLink;
  }

  async create(userId: string): Promise<ShareableUserLink> {
    const { data, error } = await this.db
      .from(SHAREABLE_USER_LINK_QUERIES.SHAREABLE_USER_LINK_TABLE)
      .insert({
        [SHAREABLE_USER_LINK_QUERIES.USER_ID]: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create shareable user link: ${error.message}`);
    }

    return data as ShareableUserLink;
  }
}
