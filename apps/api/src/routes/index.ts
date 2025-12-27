import { Hono } from "hono";
import tasks from "./tasks";

const routes = new Hono().route("/tasks", tasks);

export default routes;
