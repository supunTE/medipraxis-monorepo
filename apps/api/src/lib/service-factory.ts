import type { Context } from "hono";
import {
  ClientReportRepository,
  ClientRepository,
  ShareableCalendarLinkRepository,
  SlotWindowRepository,
  TaskRepository,
  UserRepository,
} from "../repositories";
import {
  AIService,
  ClientReportService,
  ClientService,
  ShareableCalendarLinkService,
  SlotWindowService,
  TaskService,
  UserService,
} from "../services";

import type { Env } from "../types";
import { createDatabaseClient } from "./database";

export function getTaskService(c: Context<{ Bindings: Env }>) {
  const db = createDatabaseClient(c.env);
  const taskRepository = new TaskRepository(db);
  return new TaskService(taskRepository);
}

export function getAIService(c: Context<{ Bindings: Env }>) {
  const apiKey = c.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error("API key not configured");
  }

  return new AIService(apiKey);
}

export function getSlotWindowService(c: Context<{ Bindings: Env }>) {
  const db = createDatabaseClient(c.env);
  const slotWindowRepository = new SlotWindowRepository(db);
  const taskRepository = new TaskRepository(db);
  return new SlotWindowService(slotWindowRepository, taskRepository);
}

export function getUserService(c: Context<{ Bindings: Env }>) {
  const db = createDatabaseClient(c.env);
  const userRepository = new UserRepository(db);
  return new UserService(userRepository);
}

export function getClientService(c: Context<{ Bindings: Env }>) {
  const db = createDatabaseClient(c.env);
  const clientRepository = new ClientRepository(db);
  return new ClientService(clientRepository);
}

export function getClientReportService(c: Context<{ Bindings: Env }>) {
  const db = createDatabaseClient(c.env);
  const clientReportRepository = new ClientReportRepository(db);
  return new ClientReportService(clientReportRepository);
}

export function getShareableCalendarLinkService(
  c: Context<{ Bindings: Env }>
) {
  const db = createDatabaseClient(c.env);
  const shareableCalendarLinkRepository = new ShareableCalendarLinkRepository(
    db
  );
  const slotWindowRepository = new SlotWindowRepository(db);
  return new ShareableCalendarLinkService(
    shareableCalendarLinkRepository,
    slotWindowRepository
  );
}
