import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type ModelsMapping = {
  gemini: {
    fast: LanguageModel;
    smart: LanguageModel;
  };
};

export function createModels(apiKey: string): ModelsMapping {
  const google = createGoogleGenerativeAI({ apiKey });

  const models: ModelsMapping = {
    gemini: {
      fast: google("gemini-2.5-flash"),
      smart: google("gemini-2.5-pro"),
    },
  };

  return models;
}
