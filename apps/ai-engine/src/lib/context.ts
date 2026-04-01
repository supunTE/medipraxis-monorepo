import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContext {
  userId: string;
  clientIds?: string[];
  timezone: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getUserId(): string {
  const ctx = requestContext.getStore();
  if (!ctx) throw new Error("No request context available");
  return ctx.userId;
}

export function getClientIds(): string[] | undefined {
  return requestContext.getStore()?.clientIds;
}

export function getTimezone(): string {
  const ctx = requestContext.getStore();
  // TODO: accept timezone from the user's client — hardcoded to LK time for now
  return ctx?.timezone ?? "Asia/Colombo";
}
