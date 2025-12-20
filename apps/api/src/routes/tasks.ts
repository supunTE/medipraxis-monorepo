import { Hono } from "hono";
import { getTaskService } from "../lib/service-factory";
import type { Env } from "../types/env.type";
import type { CreateTaskInput } from "../types/task";

const tasks = new Hono<{ Bindings: Env }>();

tasks.get("/", async (c) => {
  try {
    const taskService = getTaskService(c);
    const userId = c.req.query("user_id");

    const tasks = await taskService.getAllTasks(userId);

    return c.json({ tasks, count: tasks.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get tasks";
    return c.json({ error: message }, 500);
  }
});

tasks.get("/:id", async (c) => {
  try {
    const taskService = getTaskService(c);
    const taskId = c.req.param("id");

    const task = await taskService.getTaskById(taskId);

    return c.json({ task });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get task";
    const status =
      error instanceof Error && error.message === "Task not found" ? 404 : 500;
    return c.json({ error: message }, status);
  }
});

tasks.post("/", async (c) => {
  try {
    const taskService = getTaskService(c);
    const body: CreateTaskInput = await c.req.json();

    const task = await taskService.createTask(body);

    return c.json({ success: true, task }, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create task";
    return c.json({ error: message }, 400);
  }
});

export default tasks;
