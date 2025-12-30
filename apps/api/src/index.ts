import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import routes from "./routes";

const app = new Hono()
  .use("*", logger())
  .use("*", cors())
  .get("/", (c) => {
    return c.json({
      status: "ok",
      message: "MediPraxis API",
      version: "1.0.0",
    });
  })
  .route("/api", routes);

export type AppType = typeof app;

export default app;
