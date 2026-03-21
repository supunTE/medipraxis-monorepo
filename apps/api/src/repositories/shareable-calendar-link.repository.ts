import type {
  ShareableCalendarLink,
  ShareableCalendarLinkWithUser,
} from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export const SHAREABLE_CALENDAR_LINK_QUERIES = {
  FIND_BY_ID_WITH_USER: `
    link_id,
    user_id,
    visible_days_ahead,
    user:user_id (first_name, last_name)
  `,
  FIND_BY_USER_ID: `
    link_id,
    user_id,
    visible_days_ahead,
    expiry_date
  `,
} as const;

export class ShareableCalendarLinkRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async findByIdWithUser(
    linkId: string
  ): Promise<ShareableCalendarLinkWithUser | null> {
    const { data, error } = await this.db
      .from("shareable_calendar_link")
      .select(SHAREABLE_CALENDAR_LINK_QUERIES.FIND_BY_ID_WITH_USER)
      .eq("link_id", linkId)
      .eq("is_deleted", false)
      .or(`expiry_date.is.null,expiry_date.gt.${new Date().toISOString()}`)
      .single();

    if (error || !data || !data.user) {
      return null;
    }

    const userRecord = data.user as unknown as {
      first_name: string;
      last_name: string;
    };

    // Transform the nested response to flat structure
    const result: ShareableCalendarLinkWithUser = {
      link_id: data.link_id as string,
      user_id: data.user_id as string,
      visible_days_ahead: data.visible_days_ahead as number,
      user: {
        first_name: userRecord.first_name,
        last_name: userRecord.last_name,
      },
    };

    return result;
  }

  async findByUserId(userId: string): Promise<ShareableCalendarLink | null> {
    const { data, error } = await this.db
      .from("shareable_calendar_link")
      .select(SHAREABLE_CALENDAR_LINK_QUERIES.FIND_BY_USER_ID)
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .or(`expiry_date.is.null,expiry_date.gt.${new Date().toISOString()}`)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      link_id: data.link_id as string,
      user_id: data.user_id as string,
      visible_days_ahead: data.visible_days_ahead as number,
      expiry_date: data.expiry_date as string,
      created_date: "",
      is_deleted: false,
    };
  }

  async createOrUpdate(data: {
    user_id: string;
    visible_days_ahead: number;
    expiry_date?: string;
  }): Promise<ShareableCalendarLink> {
    const existingLink = await this.findByUserId(data.user_id);

    if (existingLink) {
      const { data: updated, error } = await this.db
        .from("shareable_calendar_link")
        .update({
          visible_days_ahead: data.visible_days_ahead,
          expiry_date: data.expiry_date || null,
        })
        .eq("link_id", existingLink.link_id)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Failed to update shareable calendar link: ${error.message}`
        );
      }

      return {
        link_id: updated.link_id as string,
        user_id: updated.user_id as string,
        visible_days_ahead: updated.visible_days_ahead as number,
        expiry_date: updated.expiry_date as string,
        created_date: updated.created_date as string,
        is_deleted: false,
      };
    } else {
      // Create new link
      const { data: created, error } = await this.db
        .from("shareable_calendar_link")
        .insert({
          user_id: data.user_id,
          visible_days_ahead: data.visible_days_ahead,
          expiry_date: data.expiry_date || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(
          `Failed to create shareable calendar link: ${error.message}`
        );
      }

      return {
        link_id: created.link_id as string,
        user_id: created.user_id as string,
        visible_days_ahead: created.visible_days_ahead as number,
        expiry_date: created.expiry_date as string,
        created_date: created.created_date as string,
        is_deleted: false,
      };
    }
  }
}
