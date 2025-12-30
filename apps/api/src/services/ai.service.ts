import { processAIQuery, type RouterResponse } from "@repo/ai-lib";

export class AIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async processQuery(query: string): Promise<RouterResponse> {
    if (!this.apiKey) {
      throw new Error("AI service is not available");
    }

    const response = await processAIQuery(query, this.apiKey);

    // TODO: Implement necessary workflows based on response.shouldCallWorkflow

    return response;
  }
}
