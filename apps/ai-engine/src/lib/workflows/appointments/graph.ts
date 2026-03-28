import type { ChatMessage } from "@repo/models";
import { z } from "genkit";
import { requestContext } from "../../context";
import { ai } from "../../models";
import { runAgent } from "./nodes";

async function _processAppointments(
  query: string,
  history: ChatMessage[],
  userId: string,
  clientIds?: string[]
): Promise<{ message: string }> {
  return requestContext.run(
    { userId, clientIds: clientIds?.length ? clientIds : undefined },
    () => runAgent(query, history)
  );
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
      clientIds: z.array(z.string()).optional(),
    }),
    outputSchema: z.object({
      message: z.string(),
    }),
  },
  ({ query, history = [], userId, clientIds }) =>
    _processAppointments(query, history, userId, clientIds)
);
