import { Hono } from "hono";
import ai from "./ai";
import slotWindows from "./slot_windows";
import tasks from "./tasks";
import users from "./user";

const routes = new Hono()
  .route("/tasks", tasks)
  .route("/ai", ai)
  .route("/slot-windows", slotWindows)
  .route("/users", users);

export default routes;
