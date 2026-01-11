import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { UserController } from "../controllers";

const getUserParamSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

const users = new Hono()
  // Get user by ID
  .get(
    "/:id",
    zValidator("param", getUserParamSchema),
    UserController.getUserById
  );

export default users;
