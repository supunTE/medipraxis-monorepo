import { getAuthService } from "../lib/service-factory";
import type { APIContext } from "../types";

export class AuthController {
  static async register(c: APIContext<any>) {
    const {
      username,
      mobile_number,
      mobile_country_code,
      password,
      first_name,
      last_name,
    } = await c.req.json();
    const authService = getAuthService(c);

    try {
      const result = await authService.register(
        username,
        mobile_number,
        mobile_country_code,
        password,
        first_name,
        last_name
      );
      return c.json(result, 201);
    } catch (e: any) {
      console.error("Registration error:", e);
      if (
        e.message === "Username already exists" ||
        e.message === "Mobile number already exists"
      ) {
        return c.json({ error: e.message }, 409);
      }
      return c.json({ error: e.message }, 400);
    }
  }

  static async login(c: APIContext<any>) {
    const { mobile_number, mobile_country_code, password } = await c.req.json();
    const authService = getAuthService(c);

    try {
      const result = await authService.login(
        mobile_number,
        mobile_country_code,
        password
      );
      return c.json(result);
    } catch (e: any) {
      if (e.message === "Mobile number not registered") {
        return c.json({ error: e.message }, 401);
      }
      return c.json({ error: "Invalid credentials" }, 401);
    }
  }

  static async registerAdditionalDetails(c: APIContext<any>) {
    const authService = getAuthService(c);

    try {
      const payload = c.req.valid("json");
      const user = await authService.saveAdditionalDetails(payload);
      return c.json(
        {
          message: "Additional details saved",
          user,
        },
        201
      );
    } catch (e: any) {
      if (e.message == "User not found") {
        return c.json({ error: e.message }, 404);
      }

      return c.json(
        { error: e.message ?? "Failed to save additional details" },
        400
      );
    }
  }

  static async uploadProfilePicture(
    c: APIContext<{
      form: { file: File; mobile_number: string; mobile_country_code: string };
    }>
  ) {
    try {
      const body = await c.req.parseBody();

      const file = body["file"];
      const mobileNumber = body["mobile_number"];
      const countryCode = body["mobile_country_code"];

      if (!(file instanceof File)) {
        return c.json({ error: "file is required" }, 400);
      }

      if (typeof mobileNumber !== "string" || typeof countryCode !== "string") {
        return c.json(
          { error: "mobile_number and mobile_country_code are required" },
          400
        );
      }

      const authService = getAuthService(c);

      const result = await authService.uploadProfilePicture(
        file,
        mobileNumber,
        countryCode
      );

      return c.json(result, 201);
    } catch (e: any) {
      if (e.message === "User not found") {
        return c.json({ error: e.message }, 404);
      }

      return c.json(
        { error: e.message ?? "Failed to upload profile picture" },
        400
      );
    }
  }

  static async uploadSeal(
    c: APIContext<{
      form: { file: File; mobile_number: string; mobile_country_code: string };
    }>
  ) {
    try {
      const body = await c.req.parseBody();

      const file = body["file"];
      const mobileNumber = body["mobile_number"];
      const countryCode = body["mobile_country_code"];

      if (!(file instanceof File)) {
        return c.json({ error: "file is required" }, 400);
      }

      if (typeof mobileNumber !== "string" || typeof countryCode !== "string") {
        return c.json(
          { error: "mobile_number and mobile_country_code are required" },
          400
        );
      }

      const authService = getAuthService(c);
      const result = await authService.uploadSeal(
        file,
        mobileNumber,
        countryCode
      );

      return c.json(result, 201);
    } catch (e: any) {
      if (e.message === "User not found") {
        return c.json({ error: e.message }, 404);
      }

      return c.json({ error: e.message ?? "Failed to upload seal" }, 400);
    }
  }

  static async refresh(c: APIContext<any>) {
    const { refreshToken } = await c.req.json();
    const authService = getAuthService(c);

    try {
      const result = await authService.refresh(refreshToken);
      return c.json(result);
    } catch (e: any) {
      return c.json({ error: "Invalid refresh token" }, 401);
    }
  }

  static async logout(c: APIContext<any>) {
    try {
      const body = await c.req.json().catch(() => ({}));
      const { refreshToken } = body;
      const authService = getAuthService(c);

      if (refreshToken) {
        // We can extract the user ID from the refresh token to call logout safely
        try {
          const payload =
            await authService.jwtService.verifyRefreshToken(refreshToken);
          if (payload && payload.sub) {
            await authService.logout(payload.sub as string, refreshToken);
            return c.json({ message: "Logged out from this device" });
          }
        } catch (e) {
          // If token verification fails, it might already be expired or invalid.
          // In this case, there's not much we can do safely without a userId.
          return c.json(
            { message: "Token invalid or already logged out" },
            401
          );
        }
      }

      // If we had a guaranteed authenticated user context, we could revoke all their tokens here,
      // but logout is usually called with the specific refresh token to revoke.
      return c.json({ error: "Refresh token is required for logout" }, 400);
    } catch (e) {
      return c.json({ error: "Logout failed" }, 500);
    }
  }
}
