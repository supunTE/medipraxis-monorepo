import type { Context } from "hono";
import { getTaskService } from "../lib";
import type { CreateTaskInput, Env, UpdateTaskInput } from "../types";

export class TaskController {
  static async getAllTasks(c: Context<{ Bindings: Env }>) {
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
  }

  static async getTaskById(c: Context<{ Bindings: Env }>) {
    try {
      const taskService = getTaskService(c);
      const taskId = c.req.param("id");

      const task = await taskService.getTaskById(taskId);

      return c.json({ task });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get task";
      const status =
        error instanceof Error && error.message === "Task not found"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }

  static async createTask(c: Context<{ Bindings: Env }>) {
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
  }

  static async updateTask(c: Context<{ Bindings: Env }>) {
    try {
      const taskService = getTaskService(c);
      const taskId = c.req.param("id");
      const body: UpdateTaskInput = await c.req.json();

      const task = await taskService.updateTask(taskId, body);

      return c.json({ success: true, task });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update task";
      const status =
        error instanceof Error &&
        error.message === "Task not found or could not be updated"
          ? 404
          : 400;
      return c.json({ error: message }, status);
    }
  }
}
