import type { Context } from "hono";
import {
  ClientReportRepository,
  ClientRepository,
  FormRepository,
  OtpRepository,
  RefreshTokenRepository,
  RequestReportRepository,
  ShareableCalendarLinkRepository,
  ShareableUserLinkRepository,
  SlotWindowRepository,
  TaskRepository,
  UserRepository,
} from "../repositories";
import {
  AIService,
  AuthService,
  ClientReportService,
  ClientService,
  FormService,
  OtpService,
  RequestReportService,
  ShareableCalendarLinkService,
  SlotWindowService,
  SmsService,
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
  if (!c.env.AI_ENGINE_URL || !c.env.AI_ENGINE_API_KEY) {
    throw new Error("AI Engine URL or API key not configured");
  }

  return new AIService(c.env.AI_ENGINE_URL, c.env.AI_ENGINE_API_KEY);
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
  const clientRepository = new ClientRepository(db);
  const requestReportRepository = new RequestReportRepository(db);
  const userRepository = new UserRepository(db);
  return new ClientReportService(
    clientReportRepository,
    clientRepository,
    requestReportRepository,
    userRepository
  );
}

export function getOtpService(c: Context<{ Bindings: Env }>) {
  const apiKey = c.env.TEXT_LK_API_KEY || "dev";
  const apiUrl = c.env.TEXT_LK_API_URL;
  const db = createDatabaseClient(c.env);
  const otpRepository = new OtpRepository(db);

  return new OtpService(apiKey, otpRepository, apiUrl);
}

export function getSmsService(c: Context<{ Bindings: Env }>) {
  const apiKey = c.env.TEXT_LK_API_KEY;
  const apiUrl = c.env.TEXT_LK_API_URL;

  if (!apiKey) {
    throw new Error("TEXT_LK_API_KEY not configured");
  }

  return new SmsService(apiKey, apiUrl);
}

export function getRequestReportService(c: Context<{ Bindings: Env }>) {
  const db = createDatabaseClient(c.env);
  const requestReportRepository = new RequestReportRepository(db);
  const userRepository = new UserRepository(db);
  const clientRepository = new ClientRepository(db);
  const shareableUserLinkRepository = new ShareableUserLinkRepository(db);
  const smsService = getSmsService(c);
  const webAppUrl = c.env.MEDIPRAXIS_WEB_URL;
  return new RequestReportService(
    requestReportRepository,
    userRepository,
    clientRepository,
    shareableUserLinkRepository,
    smsService,
    webAppUrl
  );
}

export function getShareableCalendarLinkService(c: Context<{ Bindings: Env }>) {
  const db = createDatabaseClient(c.env);
  const shareableCalendarLinkRepository = new ShareableCalendarLinkRepository(
    db
  );
  const slotWindowRepository = new SlotWindowRepository(db);
  const taskRepository = new TaskRepository(db);
  return new ShareableCalendarLinkService(
    shareableCalendarLinkRepository,
    slotWindowRepository,
    taskRepository
  );
}

export function getFormService(c: Context<{ Bindings: Env }>) {
  const db = createDatabaseClient(c.env);
  const formRepository = new FormRepository(db);
  return new FormService(formRepository);
}

export function getAuthService(c: Context<{ Bindings: Env }>) {
  const db = createDatabaseClient(c.env);
  const userRepository = new UserRepository(db);
  const refreshTokenRepository = new RefreshTokenRepository(db);
  return new AuthService(userRepository, refreshTokenRepository);
}
