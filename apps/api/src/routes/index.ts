import { Hono } from "hono";
import type { Env } from "../types";
import tasks from "./tasks";

const routes = new Hono<{ Bindings: Env }>();

routes.route("/tasks", tasks);

export default routes;
