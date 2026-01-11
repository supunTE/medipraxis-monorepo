import { createApiClient } from "@repo/api-client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

export const apiClient = createApiClient(API_BASE_URL);

export function updateApiClientToken(token: string) {
  return createApiClient(API_BASE_URL, token);
}
