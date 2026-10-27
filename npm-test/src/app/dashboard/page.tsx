import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Heart,
  ListOrdered,
  Settings,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { GameCard } from "@/components/game-card";
import { SetupNotice } from "@/components/setup-notice";
import { ButtonLink } from "@/components/ui/button";
import { getGameBySlug } from "@/data/games";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthUser } from "@/lib/supabase/server";
import { formatDate, getInitials, pluralise } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your dashboard",
  description: "Your saved games, play history and live trivia rooms.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="shell max-w-3xl py-12 sm:py-16">
        <p className="eyebrow">Your account</p>
        <h1 className="text-heading mt-3">Your dashboard</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
          Saved games, play history and live rooms live here once the account layer is connected.
        </p>
        <div className="mt-7">
          <SetupNotice
            title="Accounts are not connected yet"
            description="Add your Supabase environment variables and apply the migrations. Until then, you can still browse every offline game and use the game finder."
          />
        </div>
        <ButtonLink href="/games" variant="secondary" className="mt-5">
          Browse the offline games
        </ButtonLink>
      </div>
    );
  }

  const auth = await getAuthUser();
  if (!auth) redirect("/login?next=/dashboard");

  const { supabase, user } = auth;

  const [profileResult, favoritesResult, playsResult, playCountResult, roomCountResult] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase.from("favorites").select("game_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase
      .from("game_plays")
      .select("id, game_id, played_at")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .limit(8),
    supabase.from("game_plays").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("game_rooms").select("id", { count: "exact", head: true }).eq("host_user_id", user.id),
  ]);

  const displayName =
    profileResult.data?.display_name?.trim() ||
    (user.user_metadata?.display_name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "Player";

  const catalogueUnavailable = Boolean(profileResult.error || favoritesResult.error || playsResult.error);
  const favorites = favoritesResult.data ?? [];
  const plays = playsResult.data ?? [];
  const playCount = playCountResult.count ?? plays.length;
  const roomCount = roomCountResult.count ?? 0;

  const gameIds = [...new Set([...favorites.map((favorite) => favorite.game_id), ...plays.map((play) => play.game_id)])];
  let gameSlugById = new Map<string, string>();
  if (gameIds.length > 0) {
    const { data: gameRows } = await supabase.from("games").select("id, slug").in("id", gameIds);
    gameSlugById = new Map((gameRows ?? []).map((game) => [game.id, game.slug]));
  }

  const favoriteGames = favorites
    .map((favorite) => {
      const slug = gameSlugById.get(favorite.game_id);
      return slug ? getGameBySlug(slug) : undefined;
    })
    .filter((game): game is NonNullable<typeof game> => Boolean(game));

  const recentPlays = plays.flatMap((play) => {
    const slug = gameSlugById.get(play.game_id);
    const game = slug ? getGameBySlug(slug) : undefined;
    return game ? [{ game, playedAt: play.played_at }] : [];
  });

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden bg-forest text-paper-light">
        <div className="noise-overlay opacity-[0.06]" aria-hidden="true" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-amber/12 blur-3xl"
        />
        <div className="shell relative py-10 sm:py-14">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-label text-amber">Your table</p>
              <h1 className="mt-3 flex flex-wrap items-center gap-3 font-display text-[2.4rem] font-medium tracking-[-0.04em] text-paper-light sm:text-5xl">
                {displayName}
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs font-bold tracking-normal text-paper-light">
                  {getInitials(displayName)}
                </span>
              </h1>
              <p className="mt-2 text-sm text-paper-light/60">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/dashboard/settings" variant="dark" size="sm">
                <Settings className="h-4 w-4" aria-hidden="true" />
                Account settings
              </ButtonLink>
              <ButtonLink
                href="/online/trivia"
                size="sm"
                className="border-transparent bg-amber text-forest hover:bg-amber-light"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Host trivia
              </ButtonLink>
            </div>
          </div>

          <dl className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/12 bg-white/6 px-4 py-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-paper-light/45">Saved games</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-paper-light">{favorites.length}</dd>
            </div>
            <div className="rounded-xl border border-white/12 bg-white/6 px-4 py-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-paper-light/45">Games played</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-paper-light">{playCount}</dd>
            </div>
            <div className="rounded-xl border border-white/12 bg-white/6 px-4 py-3">
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-paper-light/45">Rooms hosted</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-paper-light">{roomCount}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="shell mt-8 sm:mt-10">
        {catalogueUnavailable ? (
          <div className="mb-6">
            <SetupNotice
              title="Your account is connected, but the database schema is not ready"
              description="The profile or library tables could not be read. Apply both migrations in supabase/migrations, then reload this page."
            />
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1.55fr_0.75fr] lg:gap-10">
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Saved for later</p>
                <h2 className="text-heading-sm mt-2">Your games</h2>
              </div>
              <Link href="/games" className="link-underline shrink-0 text-sm">
                Browse all
                <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {favoriteGames.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {favoriteGames.map((game) => (
                  <GameCard key={game.slug} game={game} />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-panel border border-dashed border-forest/20 bg-white/35 p-6 sm:p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta-deep">
                  <Heart className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-2xl font-medium tracking-[-0.03em] text-forest">
                  No saved games yet.
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                  Tap “Save game” on any game page and it will wait here for the next gathering. Saved
                  games are the only thing this list keeps — no recommendations based on personal data.
                </p>
                <ButtonLink href="/games" variant="secondary" className="mt-5">
                  Find a game
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </div>
            )}

            <div className="mt-10 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">The record</p>
                <h2 className="text-heading-sm mt-2">Recently played</h2>
              </div>
              <span className="text-xs text-ink-faint">{pluralise(playCount, "play")} in total</span>
            </div>

            {recentPlays.length > 0 ? (
              <ul className="mt-5 divide-y divide-line rounded-panel border border-line bg-paper-light">
                {recentPlays.map(({ game, playedAt }, index) => (
                  <li key={`${game.slug}-${playedAt}-${index}`} className="flex items-center gap-3 p-4 sm:px-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage/25 text-xs font-bold text-forest">
                      {getInitials(game.title)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link href={`/games/${game.slug}`} className="truncate text-sm font-bold text-forest hover:underline">
                        {game.title}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-faint">
                        <CalendarDays className="h-3 w-3" aria-hidden="true" />
                        {formatDate(playedAt)}
                      </p>
                    </div>
                    <Link
                      href={`/games/${game.slug}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-forest/12 text-forest transition-colors hover:bg-forest hover:text-paper-light"
                      aria-label={`Open ${game.title}`}
                    >
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-card border border-line bg-white/35 p-5">
                <p className="text-sm font-bold text-forest">Nothing logged yet.</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Open a game and choose “Mark as played” after the round. This history is private to
                  your account.
                </p>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-panel border border-line bg-paper-light p-5 shadow-soft sm:p-6">
              <p className="flex items-center gap-2 text-sm font-bold text-forest">
                <ListOrdered className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
                Keep the table moving
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                A game finder answer takes about a minute, not an evening of scrolling.
              </p>
              <ButtonLink href="/finder" variant="secondary" size="sm" className="mt-4">
                Use the game finder
              </ButtonLink>
            </div>

            <div className="rounded-panel border border-forest/10 bg-forest p-5 text-paper-light sm:p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/15 text-amber">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-medium tracking-[-0.03em] text-paper-light">
                Party Trivia
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-paper-light/60">
                Host a live room for up to ten players, or join with a code someone has already sent.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <ButtonLink
                  href="/online/trivia"
                  size="sm"
                  className="border-transparent bg-amber text-forest hover:bg-amber-light"
                >
                  Create or join a room
                </ButtonLink>
                <Link
                  href="/online"
                  className="inline-flex min-h-10 items-center text-xs font-semibold text-paper-light/55 underline decoration-white/20 underline-offset-4 hover:text-paper-light"
                >
                  How online rooms work
                </Link>
              </div>
            </div>

            <div className="rounded-card border border-line bg-white/45 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-forest">
                <Users className="h-4 w-4 text-terracotta-deep" aria-hidden="true" />
                Account scope
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                Your account stores a display name, saved games, play history and room membership. No
                public profile. No follower list. No marketing email.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
