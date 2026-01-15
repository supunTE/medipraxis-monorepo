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

  constructor(apiKey: string) {
    this.apiKey = apiKey;
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

  private otpStore = new Map<string, { otp: number; timestamp: number }>();

  storeOtp(key: string, otp: number): void {
    this.otpStore.set(key, {
      otp,
      timestamp: Date.now(),
    });

    setTimeout(
      () => {
        this.otpStore.delete(key);
      },
      5 * 60 * 1000
    );
  }

  verifyOtp(key: string, otp: string): boolean {
    const stored = this.otpStore.get(key);

    if (!stored) {
      return false;
    }

    const isExpired = Date.now() - stored.timestamp > 5 * 60 * 1000;
    if (isExpired) {
      this.otpStore.delete(key);
      return false;
    }

    const isValid = stored.otp.toString() === otp;

    if (isValid) {
      this.otpStore.delete(key);
    }

    return isValid;
  }
}
