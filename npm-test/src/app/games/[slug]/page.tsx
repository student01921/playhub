import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Lightbulb,
  PackageOpen,
  Shuffle,
  Trophy,
  Users,
} from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { GameArt } from "@/components/game-art";
import { GameCard } from "@/components/game-card";
import { RecordPlayButton } from "@/components/record-play-button";
import { ButtonLink } from "@/components/ui/button";
import {
  DIFFICULTY_LABELS,
  GAME_STYLE_LABELS,
  GAME_TYPE_LABELS,
  OCCASION_LABELS,
  formatDuration,
  formatPlayers,
  games,
  getGameBySlug,
} from "@/data/games";
import { getAuthUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getGameIdBySlug, isGameFavorited } from "@/lib/supabase/games";

type GamePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) return { title: "Game not found" };

  return {
    title: game.title,
    description: game.description,
    openGraph: {
      title: `${game.title} — a party game for ${game.minPlayers}–${game.maxPlayers} players`,
      description: game.description,
      images: [
        {
          url: "/images/pexels-8111359.jpg",
          width: 1600,
          height: 1067,
          alt: "Friends gathered around a table playing games",
        },
      ],
    },
  };
}

export default async function GameDetailPage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) notFound();

  const configured = isSupabaseConfigured();
  const auth = await getAuthUser();
  let favorited = false;
  let catalogueReady = false;

  if (auth) {
    const gameId = await getGameIdBySlug(slug);
    if (gameId) {
      catalogueReady = true;
      favorited = await isGameFavorited(auth.user.id, gameId);
    }
  }

  const related = games
    .filter((entry) => entry.slug !== game.slug)
    .sort((a, b) => {
      const sharedA = a.styles.filter((style) => game.styles.includes(style)).length;
      const sharedB = b.styles.filter((style) => game.styles.includes(style)).length;
      return sharedB - sharedA || a.durationMinutes - b.durationMinutes;
    })
    .slice(0, 3);

  const gameNumber = String(games.findIndex((entry) => entry.slug === game.slug) + 1).padStart(2, "0");
  const nextPath = `/games/${game.slug}`;

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: game.title,
    description: game.description,
    totalTime: `PT${game.durationMinutes}M`,
    supply: game.materials.map((material) => ({ "@type": "HowToSupply", name: material })),
    step: game.rules.map((rule, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: rule.title,
      text: rule.detail,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="relative overflow-hidden border-b border-line/70 pb-12 pt-6 sm:pb-16 sm:pt-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 top-0 h-[34rem] w-[34rem] rounded-full bg-sage/18 blur-3xl"
        />
        <div className="shell relative">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
            <Link href="/games" className="inline-flex min-h-10 items-center gap-1.5 transition-colors hover:text-forest">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              All games
            </Link>
            <ChevronRight className="h-3 w-3 opacity-40" aria-hidden="true" />
            <span aria-current="page" className="truncate text-forest/60">
              {game.title}
            </span>
          </nav>

          <div className="mt-5 grid gap-10 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-14">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="eyebrow">Game {gameNumber} / {String(games.length).padStart(2, "0")}</span>
                <span className="h-1 w-1 rounded-full bg-forest/25" aria-hidden="true" />
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-terracotta-deep">
                  {GAME_TYPE_LABELS[game.type]} · In person
                </span>
              </div>

              <h1 className="text-display-sm mt-4">{game.title}</h1>
              <p className="mt-3 font-display text-xl italic text-terracotta-deep sm:text-2xl">{game.tagline}</p>
              <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-ink-soft sm:text-base">
                {game.description}
              </p>

              <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-forest/15 py-5 sm:grid-cols-4">
                <div className="flex items-start gap-2.5">
                  <Users className="mt-0.5 h-4 w-4 text-forest/55" aria-hidden="true" />
                  <div>
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Players</p>
                    <p className="mt-1 text-sm font-semibold text-forest">{formatPlayers(game.minPlayers, game.maxPlayers)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock3 className="mt-0.5 h-4 w-4 text-forest/55" aria-hidden="true" />
                  <div>
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Time</p>
                    <p className="mt-1 text-sm font-semibold text-forest">{formatDuration(game.durationMinutes)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <BookOpen className="mt-0.5 h-4 w-4 text-forest/55" aria-hidden="true" />
                  <div>
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Ages</p>
                    <p className="mt-1 text-sm font-semibold text-forest">{game.minAge}+</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Trophy className="mt-0.5 h-4 w-4 text-forest/55" aria-hidden="true" />
                  <div>
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Teach</p>
                    <p className="mt-1 text-sm font-semibold text-forest">{DIFFICULTY_LABELS[game.difficulty]}</p>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:items-start">
                <ButtonLink href="#rules" size="lg" className="w-full min-[480px]:w-auto">
                  Start playing
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <FavoriteButton
                  gameSlug={game.slug}
                  gameTitle={game.title}
                  initialFavorited={favorited}
                  signedIn={Boolean(auth)}
                  configured={configured}
                  catalogueReady={catalogueReady}
                  size="md"
                  className="min-[480px]:pt-0"
                />
              </div>

              <div className="mt-2">
                <RecordPlayButton gameSlug={game.slug} signedIn={Boolean(auth)} configured={configured} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-faint">Good for</span>
                {game.occasions.map((occasion) => (
                  <Link
                    key={occasion}
                    href={`/games?occasion=${occasion}`}
                    className="inline-flex min-h-8 items-center rounded-full border border-forest/15 bg-white/45 px-3 text-[0.68rem] font-semibold text-forest/70 transition-colors hover:border-forest/30 hover:bg-white/80 hover:text-forest"
                  >
                    {OCCASION_LABELS[occasion]}
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[34rem] lg:mx-0">
              <div
                aria-hidden="true"
                className="absolute -right-3 -top-3 h-full w-full rounded-[2rem] border border-forest/10 bg-terracotta/20"
              />
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.6rem] border border-white/60 shadow-lifted">
                <GameArt theme={game.artTheme} title={game.title} />
              </div>
              <div className="glass absolute -bottom-5 left-4 right-4 rounded-2xl px-4 py-3.5 sm:left-6 sm:right-auto sm:max-w-[19rem]">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-forest/50">You&apos;ll need</p>
                <p className="mt-1.5 text-sm font-semibold leading-snug text-forest">
                  {game.materials[0]}
                </p>
                {game.materials.length > 1 ? (
                  <p className="mt-1 text-xs text-ink-faint">+ {game.materials.length - 1} more {game.materials.length === 2 ? "item" : "items"}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20.5rem] lg:gap-16">
            <article className="min-w-0">
              <div id="rules" className="scroll-mt-28">
                <p className="eyebrow">The rules</p>
                <h2 className="text-heading mt-3">How to play {game.title}</h2>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
                  These are suggested house rules. If your group has a favourite way to play,
                  use it — the point is the game, not the fine print.
                </p>

                <div className="mt-7 flex gap-3 rounded-panel border border-line bg-sage-light/35 p-4 sm:p-5">
                  <PackageOpen className="mt-0.5 h-5 w-5 shrink-0 text-forest/60" aria-hidden="true" />
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-forest/55">Before you start</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{game.setup}</p>
                  </div>
                </div>

                <ol className="mt-8 divide-y divide-forest/12 border-y border-forest/12">
                  {game.rules.map((rule, index) => (
                    <li key={rule.title} className="grid gap-2 py-6 sm:grid-cols-[3.2rem_1fr] sm:gap-5 sm:py-7">
                      <span className="font-display text-2xl font-semibold leading-none text-terracotta/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-display text-xl font-semibold leading-snug text-forest">{rule.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{rule.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-panel border border-forest/12 bg-forest p-5 text-paper-light sm:p-6">
                  <Trophy className="h-5 w-5 text-amber" aria-hidden="true" />
                  <h2 className="mt-4 font-display text-xl font-semibold text-paper-light">How to win</h2>
                  <p className="mt-2 text-sm leading-relaxed text-paper-light/70">{game.howToWin}</p>
                </div>
                <div className="rounded-panel border border-line bg-paper-light p-5 sm:p-6">
                  <Lightbulb className="h-5 w-5 text-terracotta" aria-hidden="true" />
                  <h2 className="mt-4 font-display text-xl font-semibold text-forest">Host note</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{game.hostTip}</p>
                </div>
              </div>

              <section className="mt-10" aria-labelledby="variations-heading">
                <div className="flex items-center gap-3">
                  <Shuffle className="h-5 w-5 text-forest/55" aria-hidden="true" />
                  <h2 id="variations-heading" className="text-heading-sm">Ways to change it up</h2>
                </div>
                <ul className="mt-5 grid gap-3">
                  {game.variations.map((variation) => (
                    <li key={variation} className="flex items-start gap-3 rounded-xl border border-line bg-white/35 px-4 py-3.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage/40 text-forest">
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </span>
                      <span className="text-sm leading-relaxed text-ink-soft">{variation}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </article>

            <aside className="order-first space-y-4 lg:order-last lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
              <div className="rounded-panel border border-line bg-paper-light p-5 shadow-soft">
                <p className="eyebrow">At a glance</p>
                <dl className="mt-4 divide-y divide-forest/10 text-sm">
                  <div className="flex items-start justify-between gap-4 py-3 first:pt-0">
                    <dt className="text-ink-faint">Players</dt>
                    <dd className="text-right font-semibold text-forest">{formatPlayers(game.minPlayers, game.maxPlayers)}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="text-ink-faint">Time</dt>
                    <dd className="text-right font-semibold text-forest">{formatDuration(game.durationMinutes)}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="text-ink-faint">Recommended age</dt>
                    <dd className="text-right font-semibold text-forest">{game.minAge}+</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="text-ink-faint">Difficulty</dt>
                    <dd className="text-right font-semibold text-forest">{DIFFICULTY_LABELS[game.difficulty]}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="text-ink-faint">Format</dt>
                    <dd className="text-right font-semibold text-forest">In person</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-3 last:pb-0">
                    <dt className="text-ink-faint">Style</dt>
                    <dd className="text-right font-semibold text-forest">
                      {game.styles.map((style) => GAME_STYLE_LABELS[style]).join(", ")}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-panel border border-line bg-white/40 p-5">
                <p className="eyebrow">You&apos;ll need</p>
                <ul className="mt-3 space-y-2.5">
                  {game.materials.map((material) => (
                    <li key={material} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terracotta" aria-hidden="true" />
                      {material}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-panel border border-forest/12 bg-sage-light/40 p-5">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-forest/55">Keep the group together</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  This one needs people in the same room. For friends elsewhere, try a live Party
                  Trivia room instead.
                </p>
                <Link
                  href="/online/trivia"
                  className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-forest underline decoration-forest/25 underline-offset-4 hover:decoration-forest"
                >
                  Play Party Trivia online
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-t border-line/70 bg-paper-light/55 py-14 sm:py-16" aria-labelledby="related-heading">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Stay at the table</p>
              <h2 id="related-heading" className="text-heading mt-3">If this one lands, try these next.</h2>
            </div>
            <Link
              href="/games"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-forest underline decoration-forest/25 underline-offset-4 hover:decoration-forest"
            >
              Back to the shelf
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {related.map((entry) => (
              <GameCard key={entry.slug} game={entry} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
