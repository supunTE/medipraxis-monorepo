import type { AIActionType, ChatMessage } from "@repo/models";
import { ai } from "../../models";
import { retryMiddleware } from "../../retry-config";

export const VALID_TASKS = [
  "greeting",
  "appointment",
  "reminder",
  "client_management",
  "general",
  "unknown",
] as const;

export async function guardRailCheck(
  message: string
): Promise<{ isValid: boolean; violation?: string }> {
  const prompt = ai.prompt("router/guard-rail-check");
  const result = await prompt({ message }, { use: [retryMiddleware] });
  return result.output as { isValid: boolean; violation?: string };
}

export async function identifyTask(
  message: string,
  history: ChatMessage[] = []
): Promise<{ task: AIActionType }> {
  const prompt = ai.prompt("router/task-identification");
  const messages = history.slice(-5).map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    content: [{ text: m.content }],
  }));
  const result = await prompt(
    { message },
    { messages, use: [retryMiddleware] }
  );
  const output = result.output as { task: string };
  const taskType = output.task.trim().toLowerCase().replace(/-/g, "_");

  return {
    task: VALID_TASKS.includes(taskType as AIActionType)
      ? (taskType as AIActionType)
      : "unknown",
  };
}

export async function generateResponse(
  message: string,
  task: AIActionType
): Promise<{ message: string }> {
  const promptNameMap: Record<string, string | null> = {
    greeting: "router/greeting-response",
    appointment: null,
    client_management: null,
    general: null,
    unknown: "router/unknown-response",
  };

  const promptName = promptNameMap[task];
  if (!promptName) {
    return { message: "" };
  }

  const prompt = ai.prompt(promptName);
  const result = await prompt({ message }, { use: [retryMiddleware] });
  return result.output as { message: string };
}
