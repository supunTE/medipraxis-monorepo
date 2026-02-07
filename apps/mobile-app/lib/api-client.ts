import { createApiClient } from "@repo/api-client";

// Use environment variable or default to localhost
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined");
}

export const apiClient = createApiClient(API_BASE_URL);
