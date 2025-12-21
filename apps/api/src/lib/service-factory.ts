import type { Context } from "hono";
import { TaskRepository } from "../repositories";
import { TaskService } from "../services";
import type { Env } from "../types";
import { createSupabaseClient } from "./supabase";

export function getTaskService(c: Context<{ Bindings: Env }>) {
  const supabase = createSupabaseClient(c.env);
  const taskRepository = new TaskRepository(supabase);
  return new TaskService(taskRepository);
}
