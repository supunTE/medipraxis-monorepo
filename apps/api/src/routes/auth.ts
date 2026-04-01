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
    zValidator("json", registerSchema),
    AuthController.register
  )
  .post(
    "/register/additional-details",
    zValidator("json", registerAdditionalDetailsSchema),
    AuthController.registerAdditionalDetails
  )
  .post(
    "/register/additional-details/profile-picture",
    AuthController.uploadProfilePicture
  )
  .post("/register/additional-details/seal", AuthController.uploadSeal)
  .post("/login", zValidator("json", loginSchema), AuthController.login)
  .post(
    "/refresh",
    zValidator("json", refreshTokenSchema),
    AuthController.refresh
  )
  .post("/logout", AuthController.logout);

export default auth;
