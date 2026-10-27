"use server";

import { revalidatePath } from "next/cache";
import { getGameBySlug } from "@/data/games";
import { getAuthUser } from "@/lib/supabase/server";

export interface ActionResult {
  ok: boolean;
  error?: string;
  favorited?: boolean;
}

export async function toggleFavoriteAction(gameSlug: string): Promise<ActionResult> {
  const game = getGameBySlug(gameSlug);
  if (!game) return { ok: false, error: "That game could not be found." };

  const auth = await getAuthUser();
  if (!auth) return { ok: false, error: "Please sign in to save games." };

  const { data: catalogueGame, error: catalogueError } = await auth.supabase
    .from("games")
    .select("id")
    .eq("slug", gameSlug)
    .maybeSingle();

  if (catalogueError || !catalogueGame) {
    console.error("Favourite failed — game catalogue lookup:", catalogueError?.message ?? "not found");
    return {
      ok: false,
      error: "The game catalogue has not been seeded in Supabase yet. Check the setup notes.",
    };
  }

  const { data: existing, error: existingError } = await auth.supabase
    .from("favorites")
    .select("game_id")
    .eq("user_id", auth.user.id)
    .eq("game_id", catalogueGame.id)
    .maybeSingle();

  if (existingError) {
    console.error("Favourite lookup failed:", existingError.message);
    return { ok: false, error: "We could not read your saved games. Please try again." };
  }

  if (existing) {
    const { error } = await auth.supabase
      .from("favorites")
      .delete()
      .eq("user_id", auth.user.id)
      .eq("game_id", catalogueGame.id);

    if (error) {
      console.error("Remove favourite failed:", error.message);
      return { ok: false, error: "We could not remove that favourite. Please try again." };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/games/${gameSlug}`);
    return { ok: true, favorited: false };
  }

  const { error } = await auth.supabase.from("favorites").insert({
    user_id: auth.user.id,
    game_id: catalogueGame.id,
  });

  if (error) {
    console.error("Add favourite failed:", error.message);
    return { ok: false, error: "We could not save that game. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/games/${gameSlug}`);
  return { ok: true, favorited: true };
}

export async function recordGamePlayAction(gameSlug: string): Promise<ActionResult> {
  const game = getGameBySlug(gameSlug);
  if (!game) return { ok: false, error: "That game could not be found." };

  const auth = await getAuthUser();
  if (!auth) return { ok: false, error: "Please sign in to keep a game history." };

  const { data: catalogueGame, error: catalogueError } = await auth.supabase
    .from("games")
    .select("id")
    .eq("slug", gameSlug)
    .maybeSingle();

  if (catalogueError || !catalogueGame) {
    console.error("Play history failed — game catalogue lookup:", catalogueError?.message ?? "not found");
    return {
      ok: false,
      error: "The game catalogue has not been seeded in Supabase yet. Check the setup notes.",
    };
  }

  const { error } = await auth.supabase.from("game_plays").insert({
    user_id: auth.user.id,
    game_id: catalogueGame.id,
  });

  if (error) {
    console.error("Record game play failed:", error.message);
    return { ok: false, error: "We could not add that to your history. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/games/${gameSlug}`);
  return { ok: true };
}
