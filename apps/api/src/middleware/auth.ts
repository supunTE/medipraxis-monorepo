import { createMiddleware } from "hono/factory";
import { verifyAccessToken } from "../lib/jwt";

type AuthVariables = {
  user: any; // Defines the type for c.var.user
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");
    const aiEngineKey = c.req.header("x-ai-engine-api-key");

    // Bypass check for internal AI Engine requests
    if (
      aiEngineKey &&
      process.env.AI_ENGINE_API_KEY &&
      aiEngineKey === process.env.AI_ENGINE_API_KEY
    ) {
      return await next();
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const payload = await verifyAccessToken(token);

    if (!payload) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("user", payload);
    return await next();
  }
);
