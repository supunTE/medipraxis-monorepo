import { zValidator } from "@hono/zod-validator";
import { loginSchema, refreshTokenSchema, registerSchema } from "@repo/models";
import { Hono } from "hono";
import { getAuthService } from "../lib/service-factory";
import type { Env } from "../types";

const auth = new Hono<{ Bindings: Env }>()
  .post(
    "/register",
    zValidator("json", registerSchema, (result, c) => {
      if (!result.success) {
        console.error("Validation error:", result.error);
        return c.json({ error: result.error }, 400);
      }
      return undefined;
    }),
    async (c) => {
      const { username, mobile_number, mobile_country_code, password } =
        await c.req.json();
      const authService = getAuthService(c);

      try {
        const result = await authService.register(
          username,
          mobile_number,
          mobile_country_code,
          password
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
  )
  .post("/login", zValidator("json", loginSchema), async (c) => {
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
      return c.json({ error: "Invalid credentials" }, 401);
    }
  })
  .post("/refresh", zValidator("json", refreshTokenSchema), async (c) => {
    const { refreshToken } = await c.req.json();
    const authService = getAuthService(c);

    try {
      const result = await authService.refresh(refreshToken);
      return c.json(result);
    } catch (e: any) {
      return c.json({ error: "Invalid refresh token" }, 401);
    }
  })
  .post("/logout", async (c) => {
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
  });

export default auth;
