import type { MiddlewareHandler } from "hono";
import type { Env } from "../types";

export function requireDevMode(): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    if (c.env.IS_DEV !== "true") {
      return c.json(
        { error: "Debug endpoints are only available in dev mode" },
        403
      );
    }

    return next();
  };
}
