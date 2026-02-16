import { retry } from "genkit/model/middleware";

export const retryMiddleware = retry({
  maxRetries: 3,
  initialDelayMs: 1000,
  backoffFactor: 2,
  maxDelayMs: 10000,
  statuses: [
    "UNAVAILABLE",
    "DEADLINE_EXCEEDED",
    "RESOURCE_EXHAUSTED",
    "ABORTED",
    "INTERNAL",
  ],
  onError: (error, attempt) => {
    console.log(`[Retry] Attempt ${attempt} failed:`, error.message);
  },
});
