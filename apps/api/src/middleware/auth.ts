import { createMiddleware } from "hono/factory";
import { JwtService } from "../lib/jwt";
import type { Env } from "../types";

type AuthVariables = {
  user: any; // Defines the type for c.var.user
};

export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: AuthVariables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const aiEngineKey = c.req.header("x-ai-engine-api-key");

  // Bypass check for internal AI Engine requests
  if (
    aiEngineKey &&
    c.env.AI_ENGINE_API_KEY &&
    aiEngineKey === c.env.AI_ENGINE_API_KEY
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

  const jwtService = new JwtService(
    c.env.ACCESS_TOKEN_SECRET,
    c.env.REFRESH_TOKEN_SECRET
  );
  const payload = await jwtService.verifyAccessToken(token);

  if (!payload) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", payload);
  return await next();
});
