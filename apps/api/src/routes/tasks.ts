import { zValidator } from "@hono/zod-validator";
import {
  cancelAppointmentByClientSchema,
  createTaskSchema,
  getAllTasksQuerySchema,
  getTaskParamSchema,
  reserveAppointmentByClientSchema,
  updateTaskParamSchema,
  updateTaskSchema,
} from "@repo/models";
import { Hono } from "hono";
import { TaskController } from "../controllers";

const tasks = new Hono()
  .post("/", zValidator("json", createTaskSchema), TaskController.createTask)
  .get(
    "/",
    zValidator("query", getAllTasksQuerySchema),
    TaskController.getAllTasks
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
