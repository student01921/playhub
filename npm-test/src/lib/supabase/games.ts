import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";

export async function getGameIdBySlug(slug: string): Promise<string | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.from("games").select("id").eq("slug", slug).maybeSingle();
  if (error) {
    console.error("Could not read games catalogue:", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function isGameFavorited(userId: string, gameId: string): Promise<boolean> {
  const supabase = await createServerSupabase();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("favorites")
    .select("game_id")
    .eq("user_id", userId)
    .eq("game_id", gameId)
    .maybeSingle();

  if (error) {
    console.error("Could not read favourite:", error.message);
    return false;
  }

  return Boolean(data);
}
