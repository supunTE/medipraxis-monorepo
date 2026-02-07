import { googleAI } from "@genkit-ai/google-genai";
import { genkit } from "genkit";

export const ai = genkit({
  plugins: [googleAI()],
  promptDir: "./prompts",
});

export const models = {
  gemini: {
    fast: googleAI.model("gemini-2.5-flash-lite"),
    smart: googleAI.model("gemini-2.5-flash"),
  },
};
