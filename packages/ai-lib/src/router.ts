import type { AIActionType, RouterResponse } from "@repo/models";
import { z } from "genkit";
import { ai } from "./models";
import {
  generateResponse,
  guardRailCheck,
  identifyTask,
  VALID_TASKS,
} from "./nodes";

/* ---------------- Flow schemas ---------------- */

const ProcessAIQueryInputSchema = z.object({
  query: z.string(),
});

const ProcessAIQueryOutputSchema = z.object({
  task: z.enum(VALID_TASKS),
  message: z.string().optional(),
  isValid: z.boolean(),
  guardRailViolation: z.string().optional(),
  shouldCallWorkflow: z.boolean().optional(),
});

/* ---------------- Flow ---------------- */

export const processAIQuery = ai.defineFlow(
  {
    name: "processAIQuery",
    inputSchema: ProcessAIQueryInputSchema,
    outputSchema: ProcessAIQueryOutputSchema,
  },
  async ({ query }): Promise<RouterResponse> => {
    // Node 1: guard rail check
    const guardResult = await ai.run("guardRailCheck", async () =>
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

    // Node 2: task identification
    const { task } = await ai.run("identifyTask", async () =>
      identifyTask(query)
    );

    // Route workflow tasks out before generating a response
    const workflowTasks: AIActionType[] = ["appointment", "client_management"];
    if (workflowTasks.includes(task)) {
      return {
        task,
        isValid: true,
        shouldCallWorkflow: true,
      };
    }

    // Node 3: response generation (greeting, general, unknown)
    const { message } = await ai.run("generateResponse", async () =>
      generateResponse(query, task)
    );

    return {
      task,
      message,
      isValid: true,
      shouldCallWorkflow: false,
    };
  }
);
