import { zValidator } from "@hono/zod-validator";
import {
  loginSchema,
  refreshTokenSchema,
  registerAdditionalDetailsSchema,
  registerSchema,
} from "@repo/models";
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
  .post(
    "/register/additional-details",
    zValidator("json", registerAdditionalDetailsSchema),
    AuthController.registerAdditionalDetails
  )
  .post("/login", zValidator("json", loginSchema), AuthController.login)
  .post(
    "/refresh",
    zValidator("json", refreshTokenSchema),
    AuthController.refresh
  )
  .post("/logout", AuthController.logout);

export default auth;
