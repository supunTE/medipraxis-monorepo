import type { ChatMessage } from "@repo/models";
import { ai } from "../../models";
import { retryMiddleware } from "../../retry-config";
import "./tools";

export async function runAgent(
  query: string,
  history: ChatMessage[]
): Promise<{ message: string }> {
  const prompt = ai.prompt("reminders/reminder-agent");
  const response = await prompt(
    {
      query,
      history:
        history.length > 0 ? JSON.stringify(history.slice(-5)) : undefined,
    },
    { use: [retryMiddleware] }
  );

  const text = response.text;

  return {
    message:
      text ||
      "I couldn't process your reminder request. Could you provide more details?",
  };
}
