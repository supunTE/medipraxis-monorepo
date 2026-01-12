import { Hono } from "hono";
import ai from "./ai";
import clientReports from "./client_reports";
import clients from "./clients";
import slotWindows from "./slot_windows";
import tasks from "./tasks";

const routes = new Hono()

  .route("/tasks", tasks)

  .route("/ai", ai)
  .route("/slot-windows", slotWindows)
  .route("/clients", clients)
  .route("/client-reports", clientReports);

export default routes;
