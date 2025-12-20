import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type ModelsMapping = {
  [modelName: string]: {
    [variantName: string]: LanguageModel;
  };
};

export const models: ModelsMapping = {
  gemini: {
    fast: google("gemini-2.5-flash"),
    smart: google("gemini-2.5-pro"),
  },
};
