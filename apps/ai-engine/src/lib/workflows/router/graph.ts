import type { AIActionType, ChatMessage, RouterResponse } from "@repo/models";
import { ai } from "../../models";
import { generateResponse, guardRailCheck, identifyTask, VALID_TASKS } from "./nodes";
import { runAppointmentWorkflow } from "../appointments/graph";

const WORKFLOW_TASKS: AIActionType[] = ["appointment"];
const NOT_IMPLEMENTED_TASKS: AIActionType[] = ["client_management"];

async function _processAIQuery(
  query: string,
  history: ChatMessage[],
  userId: string
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

  // Route to dedicated workflows
  if (WORKFLOW_TASKS.includes(task)) {
    const workflowMap: Partial<
      Record<
        AIActionType,
        (
          q: string,
          h: ChatMessage[],
          u: string
        ) => Promise<{ message: string }>
      >
    > = {
      appointment: runAppointmentWorkflow,
    };

    const workflow = workflowMap[task];
    if (workflow) {
      const { message } = await ai.run(`workflow:${task}`, () =>
        workflow(query, history, userId)
      );
      return { task, message, isValid: true };
    }
  }

  // Not yet implemented tasks
  if (NOT_IMPLEMENTED_TASKS.includes(task)) {
    return {
      task,
      message: "This feature is not yet implemented. Stay tuned!",
      isValid: true,
    };
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
  ({
    query,
    history = [],
    userId,
  }: {
    query: string;
    history?: ChatMessage[];
    userId: string;
  }) => _processAIQuery(query, history, userId)
);

export { VALID_TASKS };
