import { Hono } from "hono";
import { DebugController } from "../controllers";
import { requireDevMode } from "../middleware";
import type { Env } from "../types";

const debug = new Hono<{ Bindings: Env }>()
  .use("*", requireDevMode())
  .post("/seed-reminders", (c) => DebugController.seedReminders(c))
  .post("/seed-appointments", (c) => DebugController.seedAppointments(c))
  .delete("/reminders/today", (c) => DebugController.deleteTodayReminders(c))
  .delete("/appointments/today", (c) =>
    DebugController.deleteTodayAppointments(c)
  );

export default debug;
