import { zValidator } from "@hono/zod-validator";
import {
  cancelAppointmentByClientSchema,
  createTaskSchema,
  getAllTasksQuerySchema,
  getAppointmentsByClientQuerySchema,
  getTaskParamSchema,
  reserveAppointmentByClientSchema,
  updateTaskParamSchema,
  updateTaskSchema,
} from "@repo/models";
import { Hono } from "hono";
import { TaskController } from "../controllers";
import { authMiddleware } from "../middleware/auth";

const tasks = new Hono()
  .use("*", authMiddleware)
  .post("/", zValidator("json", createTaskSchema), TaskController.createTask)
  .get(
    "/",
    zValidator("query", getAllTasksQuerySchema),
    TaskController.getAllTasksByUserId
  )
  .get(
    "/appointments/client",
    zValidator("query", getAppointmentsByClientQuerySchema),
    TaskController.getAppointmentsByClientId
  )
  .get(
    "/:id",
    zValidator("param", getTaskParamSchema),
    TaskController.getTaskById
  )
  .put(
    "/:id",
    zValidator("param", updateTaskParamSchema),
    zValidator("json", updateTaskSchema),
    TaskController.updateTask
  )
  // Appointment reservation routes
  .post(
    "/appointments/reserve",
    zValidator("json", reserveAppointmentByClientSchema),
    TaskController.reserveAppointmentByClient
  )
  .post(
    "/appointments/cancel",
    zValidator("json", cancelAppointmentByClientSchema),
    TaskController.cancelAppointmentByClient
  );

export default tasks;
