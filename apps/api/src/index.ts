import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import routes from "./routes";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use("*", cors());

app.get("/", (c) => {
  return c.json({
    status: "ok",
    message: "MediPraxis API",
    version: "1.0.0",
  });
});

app.route("/api", routes);

export default app;
