import { zValidator } from "@hono/zod-validator";
import { sendOtpSchema, verifyOtpSchema } from "@repo/models";
import { Hono } from "hono";
import { OtpController } from "../controllers";

const otp = new Hono()
  .post("/send", zValidator("json", sendOtpSchema), OtpController.sendOtp)
  .post(
    "/verify",
    zValidator("json", verifyOtpSchema),
    OtpController.verifyOtp
  );

export default otp;
