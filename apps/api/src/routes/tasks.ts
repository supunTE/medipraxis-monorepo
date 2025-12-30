import { zValidator } from "@hono/zod-validator";
import {
  createTaskSchema,
  getAllTasksQuerySchema,
  getTaskParamSchema,
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
  );

export default tasks;
