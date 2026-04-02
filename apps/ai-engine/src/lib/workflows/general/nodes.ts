import type { ChatMessage } from "@repo/models";
import { ai } from "../../models";
import { retryMiddleware } from "../../retry-config";
import fs from "fs";
import path from "path";

export async function runAgent(
  query: string,
  history: ChatMessage[]
): Promise<{ message: string }> {
  const docsPath = path.join(
    process.cwd(),
    "prompts",
    "general",
    "medipraxis-documentation.md"
  );
  const docs = fs.readFileSync(docsPath, "utf-8");

  const prompt = ai.prompt("general/general-agent");
  const messages = history.slice(-5).map((m) => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    content: [{ text: m.content }],
  }));
  const response = await prompt(
    { query, docs },
    { messages, use: [retryMiddleware] }
  );

  const text = response.text;

  return {
    message:
      text ||
      "I couldn't process your general request. Could you provide more details?",
  };
}
