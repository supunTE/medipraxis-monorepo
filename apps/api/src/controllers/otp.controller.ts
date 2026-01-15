import type { SendOtpInput, VerifyOtpInput } from "@repo/models";
import { getClientService, getOtpService } from "../lib";
import type { APIContext } from "../types";

export class OtpController {
  static async sendOtp(c: APIContext<{ json: SendOtpInput }>) {
    try {
      const clientService = getClientService(c);
      const otpService = getOtpService(c);
      const body = c.req.valid("json");

      // Check if client exists
      const client = await clientService.getClientByPhone(
        body.country_code,
        body.contact_number
      );

      if (!client) {
        return c.json(
          { error: "Client not found with this phone number" },
          404
        );
      }

      // Send OTP
      const otp = await otpService.sendOtp(
        body.country_code,
        body.contact_number
      );

      // Store OTP for verification
      const otpKey = `${body.country_code}${body.contact_number}`;
      otpService.storeOtp(otpKey, otp);

      return c.json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP";
      return c.json({ error: message }, 500);
    }
  }

  static async verifyOtp(c: APIContext<{ json: VerifyOtpInput }>) {
    try {
      const otpService = getOtpService(c);
      const body = c.req.valid("json");

      const otpKey = `${body.country_code}${body.contact_number}`;
      const isValid = otpService.verifyOtp(otpKey, body.otp);

      if (!isValid) {
        return c.json({ error: "Invalid or expired OTP" }, 400);
      }

      return c.json({
        success: true,
        message: "OTP verified successfully",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to verify OTP";
      return c.json({ error: message }, 500);
    }
  }
}
