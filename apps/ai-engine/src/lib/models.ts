import { googleAI } from "@genkit-ai/google-genai";
import { genkit } from "genkit";
import path from "path";

export const ai = genkit({
  plugins: [googleAI()],
  promptDir: path.join(process.cwd(), "prompts"),
});

export const models = {
  gemini: {
    fast: googleAI.model("gemini-2.5-flash"),
    smart: googleAI.model("gemini-2.5-pro"),
  },
};
