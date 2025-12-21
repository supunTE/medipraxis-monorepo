import { Hono } from "hono";
import { TaskController } from "../controllers";
import type { Env } from "../types";

const tasks = new Hono<{ Bindings: Env }>();

tasks.get("/", TaskController.getAllTasks);
tasks.get("/:id", TaskController.getTaskById);
tasks.post("/", TaskController.createTask);
tasks.put("/:id", TaskController.updateTask);

export default tasks;
