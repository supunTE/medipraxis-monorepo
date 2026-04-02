import type { ChatMessage } from "@repo/models";
import { ai } from "../../models";
import { retryMiddleware } from "../../retry-config";
import "./tools";

export async function runAgent(
  query: string,
  history: ChatMessage[]
): Promise<{ message: string }> {
  const prompt = ai.prompt("appointments/appointment-agent");
  const messages = history.slice(-5).map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    content: [{ text: m.content }],
  }));
  const response = await prompt(
    { query },
    { messages, use: [retryMiddleware] }
  );

  const text = response.text;

  return {
    message:
      text ||
      "I couldn't process your appointment request. Could you provide more details?",
  };
}
