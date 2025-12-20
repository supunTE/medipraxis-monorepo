import type { Context } from "hono";
import { createSupabaseClient } from "../lib/supabase";
import { TaskRepository } from "../repositories/task.repository";
import { TaskService } from "../services/task.service";
import type { Env } from "../types/env.type";

export function getTaskService(c: Context<{ Bindings: Env }>) {
  const supabase = createSupabaseClient(c.env);
  const taskRepository = new TaskRepository(supabase);
  return new TaskService(taskRepository);
}
