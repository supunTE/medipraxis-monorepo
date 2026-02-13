import { createApiClient } from "@repo/api-client";

const API_BASE_URL = process.env.API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL environment variable is required");
}

export const apiClient = createApiClient(API_BASE_URL);
