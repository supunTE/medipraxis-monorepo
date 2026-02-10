import type { AIActionType, ChatMessage, RouterResponse } from "@repo/models";
import type { AIActionTools } from "./actions";
import { ai } from "./models";
import {
  generateResponse,
  guardRailCheck,
  identifyTask,
  runActionChain,
  VALID_TASKS,
} from "./nodes";

const ACTION_TASKS: AIActionType[] = ["appointment", "client_management"];

let _registeredTools: AIActionTools = {};

export function registerTools(tools: AIActionTools): void {
  _registeredTools = tools;
}

async function _processAIQuery(
  query: string,
  history: ChatMessage[]
): Promise<RouterResponse> {
  // Node 1: guard rail check
  const guardResult = await ai.run("guardRailCheck", () =>
    guardRailCheck(query)
  );

  if (!guardResult.isValid) {
    console.log(`[GUARD RAIL VIOLATION] ${guardResult.violation}`, { query });
    return {
      task: "unknown",
      message:
        "I'm sorry, but I cannot assist with that request. Please ensure your message is appropriate and respectful.",
      isValid: false,
      guardRailViolation: guardResult.violation,
    };
  }
  console.log("[GUARD RAIL CHECK] Passed", { query });

  // Node 2: task identification (history-aware)
  const { task } = await ai.run("identifyTask", () =>
    identifyTask(query, history)
  );

  // Route action tasks to their node chains
  if (ACTION_TASKS.includes(task)) {
    const tool = _registeredTools[task];
    if (!tool) {
      return {
        task,
        message: "This feature is not yet available.",
        isValid: true,
      };
    }
    const { message } = await ai.run("runActionChain", () =>
      runActionChain(query, task, history, tool)
    );
    return { task, message, isValid: true };
  }

  // Node 3: response generation (greeting, general, unknown)
  const { message } = await ai.run("generateResponse", () =>
    generateResponse(query, task)
  );

  return {
    task,
    message: message || "I'm here to help! How can I assist you?",
    isValid: true,
  };
}

export const processAIQuery = ai.defineFlow(
  { name: "processAIQuery" },
  ({ query, history = [] }: { query: string; history?: ChatMessage[] }) =>
    _processAIQuery(query, history)
);

export { VALID_TASKS };
