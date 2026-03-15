import { zValidator } from "@hono/zod-validator";
import { aiQuerySchema } from "@repo/models";
import { Hono } from "hono";
import { AIController } from "../controllers";

import { authMiddleware } from "../middleware/auth";

const ai = new Hono().post(
  "/",
  authMiddleware,
  zValidator("json", aiQuerySchema),
  AIController.handleAIRequest
);

export default ai;
