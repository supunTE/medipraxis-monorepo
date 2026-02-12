import type { ChatMessage } from "@repo/models";
import { z } from "genkit";
import { requestContext } from "../../context";
import { ai } from "../../models";
import { runAgent } from "./nodes";

async function _processAppointments(
  query: string,
  history: ChatMessage[],
  userId: string
): Promise<{ message: string }> {
  return requestContext.run({ userId }, () => runAgent(query, history));
}

export const processAppointments = ai.defineFlow(
  {
    name: "processAppointmentsFlow",
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
  ({ query, history = [], userId }) =>
    _processAppointments(query, history, userId)
);
