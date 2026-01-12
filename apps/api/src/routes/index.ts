import { Hono } from "hono";
import ai from "./ai";
import slotWindows from "./slot_windows";
import tasks from "./tasks";
import clients from "./clients";

const routes = new Hono()

  .route("/tasks", tasks)

  .route("/ai", ai)
  .route("/slot-windows", slotWindows)
  .route("/clients", clients);

export default routes;
