import type { ChatMessage, RouterResponse } from "@repo/models";

export class AIService {
  constructor(
    private readonly aiEngineUrl: string,
    private readonly aiEngineApiKey: string
  ) {}

  async query(
    query: string,
    history: ChatMessage[] = [],
    userId: string
  ): Promise<RouterResponse> {
    const response = await fetch(`${this.aiEngineUrl}/api/ai/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.aiEngineApiKey,
      },
      body: JSON.stringify({ query, history, userId }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `AI Engine request failed (${response.status}): ${errorBody}`
      );
    }

    const result = (await response.json()) as {
      success: boolean;
      data: RouterResponse;
    };

    if (!result.success) {
      throw new Error("AI Engine returned unsuccessful response");
    }

    return result.data;
  }
}
