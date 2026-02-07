import type { AIActionType } from "@repo/models";
import { ai } from "./models";

/* ---------------- Shared constants ---------------- */

export const VALID_TASKS = [
  "greeting",
  "appointment",
  "client_management",
  "general",
  "unknown",
] as const;

/* ---------------- Dotprompt definitions ---------------- */

const guardRailCheckPrompt = ai.prompt("ai-router/guard-rail-check");
const taskIdentificationPrompt = ai.prompt("ai-router/task-identification");
const greetingResponsePrompt = ai.prompt("ai-router/greeting-response");
const generalResponsePrompt = ai.prompt("ai-router/general-response");
const unknownResponsePrompt = ai.prompt("ai-router/unknown-response");

/* ---------------- Node functions ---------------- */

export async function guardRailCheck(
  message: string
): Promise<{ isValid: boolean; violation?: string }> {
  const result = await guardRailCheckPrompt({ message });
  return result.output as { isValid: boolean; violation?: string };
}

export async function identifyTask(
  message: string
): Promise<{ task: AIActionType }> {
  const result = await taskIdentificationPrompt({ message });
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
  const promptMap = {
    greeting: greetingResponsePrompt,
    appointment: null, // Will be handled by workflow
    client_management: null, // Will be handled by workflow
    general: generalResponsePrompt,
    unknown: unknownResponsePrompt,
  };

  const selectedPrompt = promptMap[task];
  if (!selectedPrompt) {
    return { message: "" };
  }

  const result = await selectedPrompt({ message });
  return result.output as { message: string };
}
