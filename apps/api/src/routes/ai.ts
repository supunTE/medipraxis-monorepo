import { zValidator } from "@hono/zod-validator";
import { aiQuerySchema } from "@repo/models";
import { Hono } from "hono";
import { AIController } from "../controllers";

const ai = new Hono().post(
  "/",
  zValidator("json", aiQuerySchema),
  AIController.handleAIRequest
);

export default ai;
