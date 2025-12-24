import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { TaskController } from "../controllers";
import { createTaskSchema , taskDetailsSchema, updateTaskSchema } from "../../../../packages/models/tasks/task.schema";
import type { Env } from "../types";

const tasks = new Hono<{ Bindings: Env }>();

tasks.get("/", TaskController.getAllTasks);
tasks.get("/:id", zValidator("json", taskDetailsSchema), TaskController.getTaskById);
tasks.post("/", zValidator("json", createTaskSchema), TaskController.createTask);
tasks.put("/:id", zValidator("json", updateTaskSchema), TaskController.updateTask);

export default tasks;
