import { ControllerResponse, type AIQueryInput } from "@repo/models";
import { getAIService } from "../lib";
import type { APIContext } from "../types/api-context";

export class AIController {
  static async handleAIRequest(c: APIContext<{ json: AIQueryInput }>) {
    try {
      const aiService = getAIService(c);
      const body = c.req.valid("json") as AIQueryInput;

      // TODO: replace hardcoded userId with actual authenticated user ID
      const userId = "2a3c19b8-d352-4b30-a2ac-1cdf993d310c";
      const response = await aiService.query(
        body.query,
        body.history ?? [],
        userId
      );

      return c.json(ControllerResponse.success(response));
    } catch (error) {
      console.error("AIController error:", error);
      return c.json(ControllerResponse.failure("AI request failed"), 500);
    }
  }
}
