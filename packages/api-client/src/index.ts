import { hc } from "hono/client";
import type { AppType } from "../../../apps/api/src";

export function createApiClient(baseUrl: string, token?: string) {
  return hc<AppType>(baseUrl, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });
}
