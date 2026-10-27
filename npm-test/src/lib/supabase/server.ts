import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function createServerSupabase(): Promise<SupabaseClient<Database> | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component. The proxy refreshes the session.
        }
      },
    },
  });
}

export async function getAuthUser(): Promise<{ supabase: SupabaseClient<Database>; user: User } | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return { supabase, user };
}

export async function getProfile(userId: string): Promise<{ display_name: string } | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();

  return data;
}
