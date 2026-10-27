import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  GraduationCap,
  Home,
  MoonStar,
  PartyPopper,
  Send,
  Sofa,
  Users,
  Wand2,
} from "lucide-react";
import { GameCard } from "@/components/game-card";
import { GameArt } from "@/components/game-art";
import { SectionHeading } from "@/components/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { games, OCCASIONS, OCCASION_LABELS, GAME_STYLES, GAME_STYLE_LABELS, type Occasion } from "@/data/games";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Good times. Great games. Everyone included.",
  description:
    "Discover in-person party games for your next gathering, or host a live trivia room everyone can join from their phone. No downloads, no complicated setup.",
};

const featuredSlugs = ["charades", "two-truths-and-a-lie", "paper-telephone"];
const featuredGames = featuredSlugs
  .map((slug) => games.find((game) => game.slug === slug))
  .filter((game): game is (typeof games)[number] => Boolean(game));

const occasionTiles: Array<{
  occasion: Occasion;
  icon: typeof Home;
  blurb: string;
  className: string;
  iconClassName: string;
  big?: boolean;
  feature?: boolean;
}> = [
  {
    occasion: "house-party",
    icon: PartyPopper,
    blurb: "Enough games to keep a room full of people moving.",
    className: "bg-forest text-paper-light",
    iconClassName: "bg-white/10 text-amber border-white/10",
    big: true,
    feature: true,
  },
  {
    occasion: "family-gathering",
    icon: Home,
    blurb: "Easy to teach, kind to mixed ages.",
    className: "bg-sage-light text-forest",
    iconClassName: "bg-white/40 text-forest border-white/50",
  },
  {
    occasion: "sleepover",
    icon: MoonStar,
    blurb: "Low light, big laughs, no rush.",
    className: "bg-terracotta text-white",
    iconClassName: "bg-white/15 text-white border-white/20",
  },
  {
    occasion: "college-event",
    icon: GraduationCap,
    blurb: "Fast rules and a little friendly chaos.",
    className: "bg-amber-light text-forest",
    iconClassName: "bg-white/40 text-forest border-white/50",
  },
  {
    occasion: "festive-gathering",
    icon: Wand2,
    blurb: "A little ceremony for the occasion.",
    className: "border border-line bg-paper-light text-forest",
    iconClassName: "bg-terracotta/10 text-terracotta-deep border-terracotta/15",
  },
  {
    occasion: "casual-hangout",
    icon: Sofa,
    blurb: "Something simple for a sofa and a spare hour.",
    className: "bg-[#DDE5D9] text-forest",
    iconClassName: "bg-white/50 text-forest border-white/60",
  },
];

function occasionCount(occasion: Occasion): number {
  return games.filter((game) => game.occasions.includes(occasion)).length;
}

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-48 h-[30rem] w-[30rem] rounded-full bg-sage/15 blur-3xl"
        />
        <div className="shell relative">
          <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14 xl:gap-20">
            <div className="max-w-[42rem]">
              <div className="flex items-center gap-3">
                <span className="h-px w-9 bg-terracotta" aria-hidden="true" />
                <p className="eyebrow">Games for the people you&apos;re with</p>
              </div>

              <h1 className="text-display mt-5">
                Good times.
                <br />
                Great games.
                <br />
                <span className="italic text-terracotta">Everyone included.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
                Find your next favourite party game, gather your people, and start playing — around
                the table or from opposite ends of the country. No downloads, no long rulebook.
              </p>

              <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row">
                <ButtonLink href="/games" size="lg" className="w-full min-[400px]:w-auto">
                  Explore the games
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink
                  href="/online/trivia"
                  variant="secondary"
                  size="lg"
                  className="w-full min-[400px]:w-auto"
                >
                  Start a trivia room
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-ink-faint">
                <span>{games.length} games in the library</span>
                <span className="h-1 w-1 rounded-full bg-forest/25" aria-hidden="true" />
                <span>Live trivia for 2–10 phones</span>
                <span className="h-1 w-1 rounded-full bg-forest/25" aria-hidden="true" />
                <span>Free to browse</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[35rem] lg:mx-0">
              <div
                aria-hidden="true"
                className="absolute -left-2 top-16 h-[72%] w-[74%] rounded-[48%_52%_45%_55%/58%_42%_58%_42%] bg-sage/35 sm:-left-6"
              />
              <div className="relative ml-auto w-[88%] max-w-[29rem]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[12rem_12rem_1.5rem_1.5rem] border border-white/70 bg-paper-deep shadow-lifted">
                  <Image
                    src="/images/pexels-8111359.jpg"
                    alt="Friends laughing and high-fiving around a table with games and drinks"
                    fill
                    priority
                    sizes="(max-width: 1024px) 80vw, 460px"
                    className="photo-warm object-cover object-[52%_40%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/30 via-transparent to-transparent" aria-hidden="true" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/25 bg-forest/45 px-4 py-3 backdrop-blur-md">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-paper-light/60">
                      The whole point
                    </p>
                    <p className="mt-1 font-display text-[1.05rem] leading-snug text-paper-light">
                      A table, a few good people, one game to start.
                    </p>
                  </div>
                </div>

                <Link
                  href="/online/trivia"
                  className="group absolute -right-3 top-16 w-[11.2rem] rounded-2xl border border-white/20 bg-forest/92 p-4 text-paper-light shadow-lifted backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-forest sm:-right-8 sm:top-20"
                >
                  <span className="flex items-center justify-between">
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-amber">Online</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-paper-light/55 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                  <span className="mt-3 block font-display text-[1.3rem] leading-none">Party Trivia</span>
                  <span className="mt-2 flex items-center gap-1.5 text-[0.68rem] font-semibold text-paper-light/60">
                    <Users className="h-3 w-3" aria-hidden="true" />
                    2–10 players
                  </span>
                </Link>
              </div>

              <div className="glass relative z-10 -mt-10 ml-2 mr-4 rounded-panel p-4 sm:-mt-12 sm:ml-0 sm:mr-auto sm:w-[72%] sm:max-w-[21rem]">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-forest/55">
                    Tonight&apos;s shortlist
                  </p>
                  <Link href="/games" className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-forest/60 hover:text-forest">
                    All games
                  </Link>
                </div>
                <ul className="mt-3 divide-y divide-forest/10">
                  {[
                    { slug: "two-truths-and-a-lie", minutes: "15 min" },
                    { slug: "charades", minutes: "25 min" },
                    { slug: "paper-telephone", minutes: "30 min" },
                  ].map((item, index) => {
                    const game = games.find((entry) => entry.slug === item.slug)!;
                    return (
                      <li key={item.slug}>
                        <Link
                          href={`/games/${game.slug}`}
                          className="group flex items-center gap-3 py-2.5"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-forest/15 bg-white/45 font-display text-xs text-forest/65">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1 text-[0.82rem] font-semibold text-forest group-hover:text-terracotta-deep">
                            {game.title}
                          </span>
                          <span className="text-[0.68rem] font-semibold text-ink-faint">{item.minutes}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div
                aria-hidden="true"
                className="absolute -bottom-5 right-3 h-24 w-24 rotate-[14deg] rounded-2xl border border-white/30 bg-terracotta/90 shadow-lifted"
              >
                <span className="absolute inset-3 rounded-xl border border-white/25" />
                <span className="absolute inset-x-5 top-1/2 -translate-y-1/2 text-center font-display text-xs leading-tight text-white/90">
                  Pick
                  <br />
                  one
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20" aria-labelledby="occasions-heading">
        <div className="shell">
          <SectionHeading
            eyebrow="Start with the occasion"
            title={<span id="occasions-heading">What kind of gathering is it?</span>}
            description="Skip the general browsing. Pick the room you are actually in and see what fits."
            action={{ href: "/games", label: "Browse all games" }}
          />

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:auto-rows-[172px]">
            {occasionTiles.map((tile) => {
              const Icon = tile.icon;
              const count = occasionCount(tile.occasion);
              return (
                <Link
                  key={tile.occasion}
                  href={`/games?occasion=${tile.occasion}`}
                  className={cn(
                    "group relative flex min-h-[158px] flex-col justify-between overflow-hidden rounded-card p-4 shadow-soft transition duration-300 ease-soft hover:-translate-y-0.5 hover:shadow-lifted sm:min-h-[172px] sm:p-5",
                    tile.big ? "col-span-2 min-h-[210px] sm:min-h-[230px] lg:col-span-6 lg:row-span-2 lg:min-h-0" : "col-span-1 lg:col-span-3",
                    tile.occasion === "college-event" && "lg:col-span-2",
                    tile.occasion === "festive-gathering" && "lg:col-span-2",
                    tile.occasion === "casual-hangout" && "col-span-2 lg:col-span-2",
                    tile.className,
                  )}
                >
                  {tile.feature ? (
                    <>
                      <Image
                        src="/images/pexels-8111365.jpg"
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 100vw, 640px"
                        className="photo-warm object-cover object-center opacity-30 transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/72 to-forest/20" aria-hidden="true" />
                    </>
                  ) : null}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-8 -right-5 font-display text-[7rem] leading-none opacity-[0.075] sm:text-[9rem]"
                  >
                    {String(count).padStart(2, "0")}
                  </div>
                  <div className="relative flex items-start justify-between gap-3">
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl border backdrop-blur-md sm:h-10 sm:w-10", tile.iconClassName)}>
                      <Icon className="h-4 w-4 sm:h-[1.1rem] sm:w-[1.1rem]" aria-hidden="true" />
                    </span>
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.11em] opacity-60">
                      {count} {count === 1 ? "game" : "games"}
                    </span>
                  </div>
                  <div className="relative mt-7">
                    <h3 className={cn("font-display font-semibold leading-[1.03] tracking-[-0.025em]", tile.big ? "text-[2rem] sm:text-[2.6rem]" : "text-[1.25rem] sm:text-[1.4rem]", tile.feature && "text-paper-light")}>
                      {OCCASION_LABELS[tile.occasion]}
                    </h3>
                    <p className={cn("mt-1.5 max-w-[23rem] text-[0.78rem] leading-relaxed sm:text-xs", tile.feature ? "text-paper-light/60" : "opacity-65")}>
                      {tile.blurb}
                    </p>
                    {tile.big ? (
                      <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold">
                        Find something for the room
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-line/80 bg-paper-light/60 py-16 sm:py-20" aria-labelledby="library-heading">
        <div className="shell">
          <SectionHeading
            eyebrow="From the library"
            title={<span id="library-heading">Three ways to break the ice.</span>}
            description="Full instructions, honest player counts, and no special equipment. Every game is ready for your next gathering."
            action={{ href: "/games", label: "Explore all 10 games" }}
          />
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredGames.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24" aria-labelledby="online-heading">
        <div className="shell">
          <div className="relative overflow-hidden rounded-panel bg-forest px-5 py-10 text-paper-light shadow-lifted sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div className="noise-overlay opacity-[0.05]" aria-hidden="true" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-36 -top-32 h-[30rem] w-[30rem] rounded-full bg-amber/10 blur-3xl"
            />
            <div className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
              <div>
                <p className="eyebrow text-amber">Online, together</p>
                <h2 id="online-heading" className="text-display-sm mt-4 text-paper-light">
                  Eight questions.
                  <br />
                  One room. <span className="italic text-amber">Zero downloads.</span>
                </h2>
                <p className="mt-5 max-w-lg text-[0.98rem] leading-relaxed text-paper-light/65">
                  Party Trivia is our live room game. One person hosts, everyone joins with a
                  six-character code, and the leaderboard does the rest. It runs in the browser on
                  the phones already in everyone&apos;s pockets.
                </p>

                <ul className="mt-7 grid gap-3 text-sm text-paper-light/75 sm:grid-cols-2">
                  {[
                    "Live rooms for 2–10 players",
                    "Share a code or a direct link",
                    "Server-scored, timed questions",
                    "Host controls the next round",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber/30 bg-amber/10 text-amber">
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
                  <ButtonLink href="/online/trivia" variant="terracotta" size="lg" className="w-full min-[420px]:w-auto">
                    Host a room
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </ButtonLink>
                  <ButtonLink href="/online/trivia#join-room" variant="dark" size="lg" className="w-full min-[420px]:w-auto">
                    Join with a code
                  </ButtonLink>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[28rem]">
                <div
                  aria-hidden="true"
                  className="absolute -inset-5 rounded-[2rem] border border-white/10 bg-white/[0.035]"
                />
                <div className="glass-dark relative rounded-panel p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-amber">Lobby preview</p>
                      <p className="mt-1 font-display text-2xl text-paper-light">Party Trivia</p>
                    </div>
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-paper-light/65">
                      Lobby
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/12 bg-forest-deep/55 p-4">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-paper-light/40">
                      Room code appears here
                    </p>
                    <div className="mt-2 flex gap-1.5" aria-hidden="true">
                      {[0, 1, 2, 3, 4, 5].map((slot) => (
                        <span key={slot} className="flex h-10 flex-1 items-center justify-center rounded-lg border border-white/12 bg-white/[0.06] font-display text-lg text-paper-light/35">
                          •
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-3">
                      <span className="flex items-center gap-2.5 text-sm font-semibold text-paper-light">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber/20 text-[0.65rem] text-amber">YOU</span>
                        Host
                      </span>
                      <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold text-sage-light">
                        <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                        Ready
                      </span>
                    </div>
                    {[0, 1].map((slot) => (
                      <div
                        key={slot}
                        className="flex min-h-[3.1rem] items-center gap-2.5 rounded-xl border border-dashed border-white/12 px-3.5 text-xs text-paper-light/35"
                      >
                        <span className="h-7 w-7 rounded-full border border-dashed border-white/20" />
                        Waiting for player {slot + 2}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3.5">
                    <span className="flex items-center gap-1.5 text-[0.7rem] text-paper-light/45">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      1 of 10 seats
                    </span>
                    <span className="text-[0.65rem] font-semibold text-paper-light/35">Start unlocks at 2+</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-paper-light/35">
                  <span className="text-paper-light/70">Lobby</span>
                  <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
                  <span>Question</span>
                  <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
                  <span>Reveal</span>
                  <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
                  <span>Results</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="finder" className="relative overflow-hidden py-16 sm:py-20" aria-labelledby="finder-heading">
        <div className="shell">
          <div className="relative overflow-hidden rounded-panel border border-line bg-sage-light/50 px-5 py-9 sm:px-9 sm:py-11 lg:px-12 lg:py-14">
            <div className="noise-overlay opacity-[0.05]" aria-hidden="true" />
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/40 bg-white/20"
            />
            <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
              <div>
                <p className="eyebrow">The game finder</p>
                <h2 id="finder-heading" className="text-heading mt-3">
                  Not sure what to play?
                  <br />
                  <span className="italic text-terracotta-deep">Let the room decide.</span>
                </h2>
                <p className="mt-4 max-w-md text-[0.96rem] leading-relaxed text-ink-soft">
                  Tell us who&apos;s there and how much time you have. We&apos;ll match you from the
                  actual catalogue, then tell you exactly why each game fits.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-forest/55">
                  <GameArt theme="paper" title="Game cards" className="hidden h-12 w-16 rounded-lg sm:block" />
                  <span>No sign-in needed. No recommendations from a black box.</span>
                </div>
              </div>

              <form action="/finder" method="get" className="glass rounded-panel p-5 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="home-occasion" className="field-label">
                      The occasion
                    </label>
                    <select id="home-occasion" name="occasion" className="select-base" defaultValue="casual-hangout">
                      {OCCASIONS.map((occasion) => (
                        <option key={occasion} value={occasion}>
                          {OCCASION_LABELS[occasion]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="home-players" className="field-label">
                      People
                    </label>
                    <input
                      id="home-players"
                      name="players"
                      type="number"
                      inputMode="numeric"
                      min={2}
                      max={30}
                      defaultValue={6}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="home-minutes" className="field-label">
                      Time
                    </label>
                    <select id="home-minutes" name="minutes" className="select-base" defaultValue="60">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">An hour</option>
                      <option value="120">Two hours</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="home-style" className="field-label">
                      Mood
                    </label>
                    <select id="home-style" name="style" className="select-base" defaultValue="any">
                      <option value="any">Surprise me</option>
                      {GAME_STYLES.map((style) => (
                        <option key={style} value={style}>
                          {GAME_STYLE_LABELS[style]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-paper-light shadow-[0_12px_28px_-16px_rgba(23,42,34,0.8)] transition duration-200 hover:bg-forest-soft active:translate-y-px"
                >
                  Find my game
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
                <p className="mt-3 text-center text-[0.68rem] font-medium text-ink-faint">
                  Matches players, age, time, and mood — instantly.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 pt-4 sm:pb-24" aria-labelledby="how-heading">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="relative">
              <div className="relative aspect-[5/4] overflow-hidden rounded-panel shadow-lifted sm:aspect-[4/3] lg:aspect-[4/5]">
                <Image
                  src="/images/pexels-8111356.jpg"
                  alt="A group of friends concentrating on a board game around a wooden table"
                  fill
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="photo-warm object-cover object-center"
                />
                <div className="absolute inset-0 bg-forest/10" aria-hidden="true" />
                <div className="glass absolute bottom-4 left-4 right-4 rounded-2xl p-4 sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-[17rem]">
                  <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-forest/50">
                    The only rule
                  </p>
                  <p className="mt-2 font-display text-lg leading-snug text-forest">
                    Read the room first. Read the rules second.
                  </p>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="absolute -bottom-4 -right-3 hidden h-20 w-20 rotate-6 rounded-2xl bg-amber shadow-soft sm:block"
              >
                <Clock3 className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 text-forest/60" />
              </div>
            </div>

            <div className="lg:py-4">
              <p className="eyebrow">How it works</p>
              <h2 id="how-heading" className="text-heading mt-3">
                From &ldquo;what now?&rdquo; to
                <br />
                <span className="italic text-terracotta">one more round.</span>
              </h2>
              <p className="mt-4 max-w-lg text-[0.97rem] leading-relaxed text-ink-soft">
                Every game page gives you the player count, materials, and a rule set you can read
                aloud. No accounts needed for in-person play.
              </p>

              <ol className="mt-8 space-y-0">
                {[
                  {
                    number: "01",
                    title: "Choose something that fits the room",
                    text: "Use the occasion tiles, browse the library, or answer six quick questions in the game finder.",
                  },
                  {
                    number: "02",
                    title: "Gather what you need",
                    text: "Most games ask for paper, pens, and people. The materials list tells you exactly what to grab before the round starts.",
                  },
                  {
                    number: "03",
                    title: "Read it aloud and press play",
                    text: "Each game has a complete step-by-step ruleset, a win condition, and a few variations for when the group wants a second round.",
                  },
                  {
                    number: "04",
                    title: "Or take it online",
                    text: "For distant friends, create a Party Trivia room, share the code, and let everyone play from their own phone.",
                  },
                ].map((step, index) => (
                  <li key={step.number} className="relative flex gap-4 pb-7 last:pb-0 sm:gap-6">
                    {index < 3 ? (
                      <span
                        aria-hidden="true"
                        className="absolute left-[1.18rem] top-9 h-[calc(100%-1.4rem)] w-px bg-forest/15 sm:left-[1.42rem]"
                      />
                    ) : null}
                    <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest/15 bg-paper-light font-display text-[0.7rem] font-semibold text-forest/65 sm:h-11 sm:w-11">
                      {step.number}
                    </span>
                    <div className="pt-0.5">
                      <h3 className="font-display text-lg font-semibold leading-snug text-forest sm:text-xl">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-ink-soft">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <Link
                href="/how-it-works"
                className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-forest/25 pb-1 text-sm font-bold text-forest transition-colors hover:border-forest"
              >
                More about how {site.name} works
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-24" aria-labelledby="cta-heading">
        <div className="shell">
          <div className="relative overflow-hidden rounded-panel bg-forest shadow-lifted">
            <Image
              src="/images/table-games.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 1248px"
              className="photo-warm object-cover object-center opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/86 to-forest/30" aria-hidden="true" />
            <div className="noise-overlay opacity-[0.08]" aria-hidden="true" />
            <div className="relative max-w-2xl px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
              <p className="eyebrow text-amber">One more round</p>
              <h2 id="cta-heading" className="text-display-sm mt-4 text-paper-light">
                The table&apos;s set.
                <br />
                <span className="italic text-amber">Bring the people.</span>
              </h2>
              <p className="mt-4 max-w-md text-[0.97rem] leading-relaxed text-paper-light/65">
                Find something everyone can play tonight — or send a room code to the group chat
                and meet on the same screen.
              </p>
              <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
                <ButtonLink href="/games" size="lg" className="w-full min-[420px]:w-auto">
                  Find a game
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/online/trivia" variant="dark" size="lg" className="w-full min-[420px]:w-auto">
                  Create a room
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
