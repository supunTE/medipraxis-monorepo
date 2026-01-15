import bcrypt from "bcryptjs";
import type { OtpRepository } from "../repositories";

interface TextLKResponse {
  status: string;
  message: string;
  data: {
    uid: string;
    to: string;
    from: string;
    message: string;
    status: string;
    cost: string;
    sms_count: number;
    otp: number;
  };
}

export class OtpService {
  private apiKey: string;
  private baseUrl = "https://app.text.lk/api/v3/sms/send";
  private isDevelopment: boolean;
  private otpRepository: OtpRepository;
  private saltRounds = 10;

  constructor(apiKey: string, otpRepository: OtpRepository) {
    this.apiKey = apiKey;
    this.otpRepository = otpRepository;
    this.isDevelopment = !apiKey || apiKey === "dev";
  }

  async sendOtp(countryCode: string, contactNumber: string): Promise<number> {
    const recipient = `${countryCode}${contactNumber}`
      .replace(/\+/g, "")
      .replace(/\s/g, "");

    const payload = {
      recipient,
      sender_id: "TextLKDemo",
      type: "otp",
      message: "Your MediPraxis verification code is: {{OTP5}}",
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to send OTP: ${response.status} - ${errorText}`
        );
      }

      const data = (await response.json()) as TextLKResponse;

      if (data.status !== "success") {
        throw new Error(`Failed to send OTP: ${data.message}`);
      }

      return data.data.otp;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OTP service error: ${error.message}`);
      }
      throw new Error("Unknown error occurred while sending OTP");
    }
  }

  async storeOtp(key: string, otp: number): Promise<void> {
    const hashedOtp = await bcrypt.hash(otp.toString(), this.saltRounds);
    const expiresAt = new Date(Date.now() + 60 * 1000);
    await this.otpRepository.storeOtp(key, hashedOtp, expiresAt);
  }

  async verifyOtp(key: string, otp: string): Promise<boolean> {
    const record = await this.otpRepository.getOtp(key);

    if (!record) {
      return false;
    }

    if (record.attempts >= 3) {
      await this.otpRepository.deleteOtp(key);
      return false;
    }

    const isExpired = new Date(record.expires_date) < new Date();
    if (isExpired) {
      await this.otpRepository.deleteOtp(key);
      return false;
    }

    const isValid = await bcrypt.compare(otp, record.otp_code);

    if (isValid) {
      await this.otpRepository.deleteOtp(key);
    } else {
      await this.otpRepository.incrementAttempts(key);
    }

    return isValid;
  }
}
