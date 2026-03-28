import { zValidator } from "@hono/zod-validator";
import {
  cancelAppointmentByClientSchema,
  createTaskSchema,
  getAllTasksQuerySchema,
  getAppointmentsByClientQuerySchema,
  getTaskParamSchema,
  getTaskSummaryQuerySchema,
  reserveAppointmentByClientSchema,
  updateTaskParamSchema,
  updateTaskSchema,
} from "@repo/models";
import { Hono } from "hono";
import { TaskController } from "../controllers";
import { authMiddleware } from "../middleware/auth";

const tasks = new Hono()
  // Mobile-only endpoints (require auth)
  .post(
    "/",
    authMiddleware,
    zValidator("json", createTaskSchema),
    TaskController.createTask
  )
  .get(
    "/",
    authMiddleware,
    zValidator("query", getAllTasksQuerySchema),
    TaskController.getAllTasksByUserId
  )
  .get(
    "/summary",
    authMiddleware,
    zValidator("query", getTaskSummaryQuerySchema),
    TaskController.getTaskSummaryByUserId
  )
  .get(
    "/upcoming",
    authMiddleware,
    zValidator("query", getTaskSummaryQuerySchema),
    TaskController.getUpcomingTasksByUserId
  )
  .get(
    "/appointments/client",
    authMiddleware,
    zValidator("query", getAppointmentsByClientQuerySchema),
    TaskController.getAppointmentsByClientId
  )
  .get(
    "/:id",
    authMiddleware,
    zValidator("param", getTaskParamSchema),
    TaskController.getTaskById
  )
  .put(
    "/:id",
    authMiddleware,
    zValidator("param", updateTaskParamSchema),
    zValidator("json", updateTaskSchema),
    TaskController.updateTask
  )
  // Web app endpoints (no auth)
  .post(
    "/appointments/reserve",
    zValidator("json", reserveAppointmentByClientSchema),
    TaskController.reserveAppointmentByClient
  )
  .post(
    "/appointments/reserve/practitioner",
    authMiddleware,
    zValidator("json", reserveAppointmentByClientSchema),
    TaskController.reserveAppointmentByPractitioner
  )
  .post(
    "/appointments/cancel",
    zValidator("json", cancelAppointmentByClientSchema),
    TaskController.cancelAppointmentByClient
  );

export default tasks;
