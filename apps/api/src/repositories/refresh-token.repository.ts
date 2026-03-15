import type { SupabaseClient } from "@supabase/supabase-js";

export const REFRESH_TOKEN_TABLE = "refresh_tokens";

export class RefreshTokenRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    const { error } = await this.db.from(REFRESH_TOKEN_TABLE).insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      throw new Error(`Failed to create refresh token: ${error.message}`);
    }
  }

  async findTokensByUserId(userId: string) {
    const { data, error } = await this.db
      .from(REFRESH_TOKEN_TABLE)
      .select("*")
      .eq("user_id", userId)
      .eq("revoked", false)
      .gt("expires_at", new Date().toISOString());

    if (error) {
      throw new Error(`Failed to find user tokens: ${error.message}`);
    }

    return data || [];
  }

  async findRefreshToken(tokenHash: string) {
    const { data, error } = await this.db
      .from(REFRESH_TOKEN_TABLE)
      .select("*")
      .eq("token_hash", tokenHash)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to find refresh token: ${error.message}`);
    }

    return data || null;
  }

  async revokeRefreshToken(tokenHash: string) {
    const { error } = await this.db
      .from(REFRESH_TOKEN_TABLE)
      .update({ revoked: true })
      .eq("token_hash", tokenHash);

    if (error) {
      throw new Error(`Failed to revoke refresh token: ${error.message}`);
    }
  }

  async revokeAllUserTokens(userId: string) {
    const { error } = await this.db
      .from(REFRESH_TOKEN_TABLE)
      .update({ revoked: true })
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to revoke user tokens: ${error.message}`);
    }
  }
}
