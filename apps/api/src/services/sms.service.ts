interface TextLKSmsResponse {
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
  };
}

interface TextLKErrorResponse {
  status: string;
  message: string;
}

export interface SendSmsResult {
  success: boolean;
  uid?: string;
  error?: string;
}

export class SmsService {
  private apiKey: string;
  private baseUrl = "https://app.text.lk/api/v3/sms/send";
  private senderId: string;

  constructor(apiKey: string, senderId: string = "MediPraxis") {
    if (!apiKey) {
      throw new Error("SMS API key is required");
    }
    this.apiKey = apiKey;
    this.senderId = senderId;
  }

  async sendSms(phoneNumber: string, message: string): Promise<SendSmsResult> {
    if (!message || message.trim().length === 0) {
      throw new Error("SMS message cannot be empty");
    }

    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    const formattedPhone = phoneNumber.replace(/[\s+]/g, "");

    const payload = {
      recipient: formattedPhone,
      sender_id: this.senderId,
      type: "plain",
      message: message.trim(),
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
        let errorMessage: string;

        try {
          const errorJson = JSON.parse(errorText) as TextLKErrorResponse;
          errorMessage = errorJson.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`;
        }

        return {
          success: false,
          error: `Failed to send SMS: ${errorMessage}`,
        };
      }

      const data = (await response.json()) as TextLKSmsResponse;

      if (data.status !== "success") {
        return {
          success: false,
          error: data.message || "Unknown error occurred",
        };
      }

      return {
        success: true,
        uid: data.data.uid,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      return {
        success: false,
        error: `SMS service error: ${errorMessage}`,
      };
    }
  }
}
