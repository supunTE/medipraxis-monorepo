import { zValidator } from "@hono/zod-validator";
import { saveUserKeysSchema } from "@repo/models";
import { Hono } from "hono";
import { UserKeysController } from "../controllers";
import { authMiddleware } from "../middleware/auth";

const userKeys = new Hono()
  // Unauthenticated: returns only the public key for a given user
  .get("/:userId/public-key", UserKeysController.getPublicKey)
  // Authenticated routes
  .post(
    "/",
    authMiddleware,
    zValidator("json", saveUserKeysSchema),
    UserKeysController.saveUserKeys
  )
  .get("/", authMiddleware, UserKeysController.getUserKeys);

export default userKeys;
