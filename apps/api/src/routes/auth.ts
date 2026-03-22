import { zValidator } from "@hono/zod-validator";
import { loginSchema, refreshTokenSchema, registerSchema } from "@repo/models";
import { Hono } from "hono";
import { AuthController } from "../controllers/auth.controller";
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
    AuthController.register
  )
  .post("/login", zValidator("json", loginSchema), AuthController.login)
  .post("/refresh", zValidator("json", refreshTokenSchema), AuthController.refresh)
  .post("/logout", AuthController.logout);

export default auth;
