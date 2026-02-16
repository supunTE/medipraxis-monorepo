import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContext {
  userId: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getUserId(): string {
  const ctx = requestContext.getStore();
  if (!ctx) throw new Error("No request context available");
  return ctx.userId;
}
