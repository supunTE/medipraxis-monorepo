import { createClient } from "@supabase/supabase-js";
import type { Env } from "../types";

export function createDatabaseClient(env: Env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error(
      `Missing database credentials: URL=${!!env.SUPABASE_URL}, KEY=${!!env.SUPABASE_ANON_KEY}`
    );
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}
