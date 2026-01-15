import type { SendOtpInput, VerifyOtpInput } from "@repo/models";
import { getClientService, getOtpService } from "../lib";
import type { APIContext } from "../types";

export class OtpController {
  static async sendOtp(c: APIContext<{ json: SendOtpInput }>) {
    try {
      const clientService = getClientService(c);
      const otpService = getOtpService(c);
      const body = c.req.valid("json");

      const clients = await clientService.getClientByPhone(
        body.country_code,
        body.contact_number
      );

      if (clients.length === 0) {
        return c.json(
          { error: "Client not found with this phone number" },
          404
        );
      }

      const otp = await otpService.sendOtp(
        body.country_code,
        body.contact_number
      );

      const otpKey = `${body.country_code}${body.contact_number}`;
      await otpService.storeOtp(otpKey, otp);

      return c.json({
        success: true,
        message: "OTP sent successfully",
        contact_id: clients[0]!.contact_id,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP";
      return c.json({ error: message }, 500);
    }
  }

  static async verifyOtp(c: APIContext<{ json: VerifyOtpInput }>) {
    try {
      const clientService = getClientService(c);
      const otpService = getOtpService(c);
      const body = c.req.valid("json");

      const otpKey = `${body.country_code}${body.contact_number}`;
      const isValid = await otpService.verifyOtp(otpKey, body.otp);

      if (!isValid) {
        return c.json({ error: "Invalid or expired OTP" }, 400);
      }

      const clients = await clientService.getClientByPhone(
        body.country_code,
        body.contact_number
      );

      return c.json({
        success: true,
        message: "OTP verified successfully",
        contact_id: clients.length > 0 ? clients[0]!.contact_id : undefined,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to verify OTP";
      return c.json({ error: message }, 500);
    }
  }
}
