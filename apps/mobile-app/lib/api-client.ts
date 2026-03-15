import { createApiClient } from "@repo/api-client";
import { authService } from "../services/auth";
import { authStorage } from "../utils/storage";

// Use environment variable or default to localhost
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined");
}

// Custom fetch wrapper to handle auth
const customFetch: typeof fetch = async (input, init) => {
  // 1. Inject Token
  const token = await authStorage.getAccessToken();
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Ensure we don't double-wrap headers if init.headers was simple object
  // Hono/fetch handles Headers object fine.

  const config = { ...init, headers };

  // Normalize URL
  const urlStr = input.toString();

  try {
    const response = await fetch(input, config);

    // 2. Handle 401
    if (response.status === 401) {
      // Avoid infinite loop if refresh endpoint itself returns 401
      if (urlStr.includes("/auth/refresh") || urlStr.includes("/auth/login")) {
        return response;
      }

      try {
        // Try to refresh
        const newToken = await authService.refresh();

        if (newToken) {
          // Retry original request with new token
          headers.set("Authorization", `Bearer ${newToken}`);
          return fetch(input, { ...config, headers });
        } else {
          // Refresh failed - logout/clear tokens happens in refresh()
          return response;
        }
      } catch (e) {
        return response;
      }
    }

    return response;
  } catch (e) {
    throw e;
  }
};

export const apiClient = createApiClient(API_BASE_URL, {
  fetch: customFetch,
});
