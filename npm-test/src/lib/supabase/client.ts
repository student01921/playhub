import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseConfig } from "@/lib/supabase/config";

let browserClient: SupabaseClient<Database> | null = null;

export function getBrowserSupabase(): SupabaseClient<Database> | null {
  const config = getSupabaseConfig();
  if (!config) return null;

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(config.url, config.anonKey);
  }

  return browserClient;
}
