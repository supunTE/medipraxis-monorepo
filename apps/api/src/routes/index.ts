import { Hono } from "hono";
import ai from "./ai";
import tasks from "./tasks";

const routes = new Hono().route("/tasks", tasks).route("/ai", ai);

export default routes;
