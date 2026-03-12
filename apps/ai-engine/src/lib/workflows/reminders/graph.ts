import type { ChatMessage } from "@repo/models";
import { z } from "genkit";
import { requestContext } from "../../context";
import { ai } from "../../models";
import { runAgent } from "./nodes";

async function _processReminders(
  query: string,
  history: ChatMessage[],
  userId: string
): Promise<{ message: string }> {
  return requestContext.run({ userId }, () => runAgent(query, history));
}

export const processReminders = ai.defineFlow(
  {
    name: "processRemindersFlow",
    inputSchema: z.object({
      query: z.string(),
      history: z
        .array(
          z.object({ role: z.enum(["user", "assistant"]), content: z.string() })
        )
        .optional(),
      userId: z.string(),
    }),
    outputSchema: z.object({
      message: z.string(),
    }),
  },
  ({ query, history = [], userId }) => _processReminders(query, history, userId)
);
