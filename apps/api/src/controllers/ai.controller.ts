import type { AIQueryInput } from "@repo/models";
import { getAIService } from "../lib";
import type { APIContext } from "../types/api-context";

export class AIController {
  static async handleAIRequest(c: APIContext<{ json: AIQueryInput }>) {
    try {
      const aiService = getAIService(c);
      const body = c.req.valid("json") as AIQueryInput;

      const response = await aiService.processQuery(body.query);

      return c.json({ success: true, response });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to process AI request";
      return c.json({ success: false, error: message }, 500);
    }
  }
}
