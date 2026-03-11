import { Hono } from "hono";
import ai from "./ai";
import auth from "./auth";
import clientReports from "./client_reports";
import clients from "./clients";
import forms from "./forms";
import otp from "./otp";
import requestReports from "./request_reports";
import shareableCalendarLinks from "./shareable-calendar-links";
import slotWindows from "./slot_windows";
import tasks from "./tasks";
import users from "./user";

const routes = new Hono()
  .route("/auth", auth)
  .route("/tasks", tasks)
  .route("/ai", ai)
  .route("/slot-windows", slotWindows)
  .route("/users", users)
  .route("/clients", clients)
  .route("/client-reports", clientReports)
  .route("/shareable-calendar-links", shareableCalendarLinks)
  .route("/otp", otp)
  .route("/forms", forms)
  .route("/request-reports", requestReports);

export default routes;
