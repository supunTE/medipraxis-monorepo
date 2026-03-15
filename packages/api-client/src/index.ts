import type { ClientRequestOptions } from "hono/client";
import { hc } from "hono/client";
import type { AppType } from "../../../apps/api/src";

export type { AppType };

export function createApiClient(
  baseUrl: string,
  options?: ClientRequestOptions
) {
  return hc<AppType>(baseUrl, options);
}
