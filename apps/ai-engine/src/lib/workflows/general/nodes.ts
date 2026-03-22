import type { ChatMessage } from "@repo/models";
import { ai } from "../../models";
import { retryMiddleware } from "../../retry-config";
import fs from "fs";
import path from "path";

export async function runAgent(
  query: string,
  history: ChatMessage[]
): Promise<{ message: string }> {
  // Read the documentation file directly
  const docsPath = path.join(
    process.cwd(),
    "prompts",
    "general",
    "medipraxis-documentation.md"
  );
  const docs = fs.readFileSync(docsPath, "utf-8");

  const prompt = ai.prompt("general/general-agent");
  const response = await prompt(
    {
      query,
      docs,
      history:
        history.length > 0 ? JSON.stringify(history.slice(-5)) : undefined,
    },
    { use: [retryMiddleware] }
  );

  const text = response.text;

  return {
    message:
      text ||
      "I couldn't process your general request. Could you provide more details?",
  };
}
