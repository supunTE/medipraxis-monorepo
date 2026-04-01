import type { CreateUserPayload } from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export const USER_QUERIES = {
  USER_TABLE: "app_user",
  USER_BASE: "*",
  USER_PROFILE_PICTURE_BUCKET: "user profile picture",
  USER_SEAL_BUCKET: "user seal",
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

  async findUserByMobile(mobileNumber: string, countryCode: string) {
    const { data, error } = await this.db
      .from(USER_QUERIES.USER_TABLE)
      .select(USER_QUERIES.USER_BASE)
      .eq("mobile_number", mobileNumber)
      .eq("mobile_country_code", countryCode)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to find user by mobile number: ${error.message}`);
    }

    return data || null;
  }

  async findUserByUsername(username: string) {
    const { data, error } = await this.db
      .from(USER_QUERIES.USER_TABLE)
      .select(USER_QUERIES.USER_BASE)
      .ilike("username", username)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to find user by username: ${error.message}`);
    }

    return data || null;
  }

  async findUserByEmail(email: string) {
    const { data, error } = await this.db
      .from(USER_QUERIES.USER_TABLE)
      .select(USER_QUERIES.USER_BASE)
      .eq("email_address", email)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "Row not found"
      throw new Error(`Failed to find user by email: ${error.message}`);
    }

    return data || null;
  }

  async createUser(payload: CreateUserPayload) {
    const { data, error } = await this.db
      .from(USER_QUERIES.USER_TABLE)
      .insert({
        mobile_number: payload.mobile_number,
        mobile_country_code: payload.mobile_country_code,
        password_hash: payload.password_hash,
        username: payload.username,
        first_name: payload.first_name,
        last_name: payload.last_name,
        // TODO: Add other fields as necessary based on schema defaults
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
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

  async updateAdditionalDetailsByMobile(
    mobileNumber: string,
    countryCode: string,
    updateData: {
      title: string;
      first_name: string;
      last_name: string;
      role: string;
      registration_number: string;
      specialization: string;
      whatsapp_country_code?: string;
      whatsapp_number?: string;
      email_address?: string;
    }
  ) {
    const { data, error } = await this.db
      .from(USER_QUERIES.USER_TABLE)
      .update({
        ...updateData,
      })
      .eq("mobile_number", mobileNumber)
      .eq("mobile_country_code", countryCode)
      .select()
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to update additional details: ${error.message}`);
    }

    return data || null;
  }

  async uploadProfilePictureForUser(
    file: File,
    userId: string
  ): Promise<{ filePath: string; publicUrl: string; user: any }> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/profile/${fileName}`;

    const { error } = await this.db.storage
      .from(USER_QUERIES.USER_PROFILE_PICTURE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload profile picture: ${error.message}`);
    }

    const { data } = this.db.storage
      .from(USER_QUERIES.USER_PROFILE_PICTURE_BUCKET)
      .getPublicUrl(filePath);

    const user = await this.updateUser(userId, {
      photo_url: data.publicUrl,
    });

    return {
      filePath,
      publicUrl: data.publicUrl,
      user,
    };
  }

  async uploadSealForUser(
    file: File,
    userId: string
  ): Promise<{ filePath: string; publicUrl: string; user: any }> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/seal/${fileName}`;

    const { error } = await this.db.storage
      .from(USER_QUERIES.USER_SEAL_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload seal: ${error.message}`);
    }

    const { data } = this.db.storage
      .from(USER_QUERIES.USER_SEAL_BUCKET)
      .getPublicUrl(filePath);

    const user = await this.updateUser(userId, {
      seal_url: data.publicUrl,
    });

    return {
      filePath,
      publicUrl: data.publicUrl,
      user,
    };
  }
}
