import type { SupabaseClient } from "@supabase/supabase-js";

export const OTP_QUERIES = {
  OTP_CODES_TABLE: "otp_codes",
  OPT_CODE_ID: "opt_code_id",
  PHONE_KEY: "phone_key",
  OTP_CODE: "otp_code",
  CREATED_DATE: "created_date",
  EXPIRES_DATE: "expires_date",
  ATTEMPTS: "attempts",
} as const;

interface OtpRecord {
  opt_code_id: string;
  phone_key: string;
  otp_code: string;
  created_date: string;
  expires_date: string;
  attempts: number;
}

export class OtpRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async storeOtp(
    phoneKey: string,
    hashedOtp: string,
    expiresAt: Date
  ): Promise<void> {
    const { error } = await this.db.from(OTP_QUERIES.OTP_CODES_TABLE).upsert(
      {
        [OTP_QUERIES.PHONE_KEY]: phoneKey,
        [OTP_QUERIES.OTP_CODE]: hashedOtp,
        [OTP_QUERIES.EXPIRES_DATE]: expiresAt.toISOString(),
        [OTP_QUERIES.ATTEMPTS]: 0,
      },
      {
        onConflict: OTP_QUERIES.PHONE_KEY,
      }
    );

    if (error) {
      throw new Error(`Failed to store OTP: ${error.message}`);
    }
  }

  async getOtp(phoneKey: string): Promise<OtpRecord | null> {
    const { data, error } = await this.db
      .from(OTP_QUERIES.OTP_CODES_TABLE)
      .select("*")
      .eq(OTP_QUERIES.PHONE_KEY, phoneKey)
      .single();

    if (error || !data) {
      return null;
    }

    return data as OtpRecord;
  }

  async deleteOtp(phoneKey: string): Promise<void> {
    const { error } = await this.db
      .from(OTP_QUERIES.OTP_CODES_TABLE)
      .delete()
      .eq(OTP_QUERIES.PHONE_KEY, phoneKey);

    if (error) {
      throw new Error(`Failed to delete OTP: ${error.message}`);
    }
  }

  async incrementAttempts(phoneKey: string): Promise<void> {
    const record = await this.getOtp(phoneKey);
    if (!record) return;

    const { error } = await this.db
      .from(OTP_QUERIES.OTP_CODES_TABLE)
      .update({ [OTP_QUERIES.ATTEMPTS]: record.attempts + 1 })
      .eq(OTP_QUERIES.PHONE_KEY, phoneKey);

    if (error) {
      throw new Error(`Failed to increment attempts: ${error.message}`);
    }
  }

  async cleanupExpired(): Promise<void> {
    const { error } = await this.db
      .from(OTP_QUERIES.OTP_CODES_TABLE)
      .delete()
      .lt(OTP_QUERIES.EXPIRES_DATE, new Date().toISOString());

    if (error) {
      console.error("Failed to cleanup expired OTPs:", error);
    }
  }
}
