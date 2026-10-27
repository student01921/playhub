"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Minus,
  Plus,
  RefreshCcw,
  SearchX,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { GameArt } from "@/components/game-art";
import { Button } from "@/components/ui/button";
import {
  GAME_STYLES,
  GAME_STYLE_LABELS,
  OCCASIONS,
  OCCASION_LABELS,
  formatDuration,
  formatPlayers,
  type GameStyle,
  type Occasion,
} from "@/data/games";
import {
  FINDER_DEFAULTS,
  getRecommendations,
  type FinderPreferences,
} from "@/lib/matching";
import { cn } from "@/lib/utils";

const ageOptions = [
  { value: "8", label: "Family", detail: "8+" },
  { value: "13", label: "Teens", detail: "13+" },
  { value: "18", label: "Adults", detail: "18+" },
] as const;

const timeOptions = [15, 30, 45, 60, 120] as const;

const formatOptions = [
  { value: "all", label: "Either way", detail: "In person or online" },
  { value: "offline", label: "In person", detail: "Around a table" },
  { value: "online", label: "Online", detail: "Everyone on a phone" },
] as const;

function OptionButton({
  active,
  onClick,
  children,
  className,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={cn(
        "flex min-h-11 flex-col items-start justify-center rounded-xl border px-3.5 py-2.5 text-left text-sm font-semibold transition duration-200 ease-soft",
        active
          ? "border-forest bg-forest text-paper-light shadow-sm"
          : "border-forest/15 bg-white/55 text-forest hover:border-forest/30 hover:bg-white/85",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GameFinder({ initialPreferences }: { initialPreferences: FinderPreferences }) {
  const [preferences, setPreferences] = useState<FinderPreferences>(initialPreferences);
  const [resetCount, setResetCount] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const recommendations = useMemo(() => getRecommendations(preferences), [preferences]);
  const noStyleMatch = recommendations[0]?.note;

  function update<K extends keyof FinderPreferences>(key: K, value: FinderPreferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setPreferences({ ...FINDER_DEFAULTS });
    setResetCount((count) => count + 1);
  }

  function scrollToResults() {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[23rem_1fr] lg:gap-10 xl:grid-cols-[25rem_1fr]">
      <form
        className="rounded-panel border border-line bg-paper-light/80 p-5 shadow-soft backdrop-blur-sm sm:p-6 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]"
        onSubmit={(event) => {
          event.preventDefault();
          scrollToResults();
        }}
        aria-label="Game finder preferences"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-forest/50">Your room</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-forest">Set the scene</h2>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-forest/55 hover:bg-forest/5 hover:text-forest"
          >
            <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className="mt-5 space-y-6">
          <fieldset>
            <legend className="field-label">01 · Occasion</legend>
            <div className="grid grid-cols-2 gap-2">
              {OCCASIONS.map((occasion) => (
                <OptionButton
                  key={occasion}
                  active={preferences.occasion === occasion}
                  onClick={() => update("occasion", occasion)}
                  className="text-xs"
                >
                  {OCCASION_LABELS[occasion]}
                </OptionButton>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="field-label">02 · The people</legend>
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => update("players", Math.max(2, preferences.players - 1))}
                className="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-forest/15 bg-white/55 text-forest transition-colors hover:bg-white"
                aria-label="Fewer players"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <label className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-forest/15 bg-white/55 px-3 text-center">
                <Users className="h-4 w-4 text-forest/50" aria-hidden="true" />
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={preferences.players}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    update("players", Number.isFinite(value) ? Math.min(30, Math.max(2, Math.round(value))) : 2);
                  }}
                  className="w-10 border-0 bg-transparent p-0 text-center text-base font-bold text-forest focus:outline-none"
                  aria-label="Number of players"
                />
                <span className="text-sm font-semibold text-forest/60">players</span>
              </label>
              <button
                type="button"
                onClick={() => update("players", Math.min(30, preferences.players + 1))}
                className="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-forest/15 bg-white/55 text-forest transition-colors hover:bg-white"
                aria-label="More players"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3">
              <p className="mb-2 text-[0.68rem] font-semibold text-ink-faint">Youngest player</p>
              <div className="grid grid-cols-3 gap-2">
                {ageOptions.map((option) => (
                  <OptionButton
                    key={option.value}
                    active={preferences.ageGroup === option.value}
                    onClick={() => update("ageGroup", option.value)}
                    className="items-center text-center text-xs"
                  >
                    <span>{option.label}</span>
                    <span className={cn("mt-0.5 text-[0.65rem] font-medium", preferences.ageGroup === option.value ? "text-paper-light/60" : "text-ink-faint")}>
                      {option.detail}
                    </span>
                  </OptionButton>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="field-label">03 · Time and place</legend>
            <div className="grid grid-cols-3 gap-2">
              {timeOptions.map((minutes) => (
                <OptionButton
                  key={minutes}
                  active={preferences.minutes === minutes}
                  onClick={() => update("minutes", minutes)}
                  className="items-center text-center text-xs"
                >
                  {minutes === 120 ? "2 hr" : `${minutes} min`}
                </OptionButton>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {formatOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  active={preferences.format === option.value}
                  onClick={() => update("format", option.value)}
                  className="items-center text-center text-xs"
                >
                  <span>{option.label}</span>
                </OptionButton>
              ))}
            </div>
            <p className="field-hint">Time is a maximum, not a target.</p>
          </fieldset>

          <fieldset>
            <legend className="field-label">04 · Mood</legend>
            <div className="grid grid-cols-2 gap-2">
              <OptionButton
                active={preferences.style === "any"}
                onClick={() => update("style", "any")}
                className="col-span-2 text-xs"
              >
                Any kind of energy
              </OptionButton>
              {GAME_STYLES.map((style) => (
                <OptionButton
                  key={style}
                  active={preferences.style === style}
                  onClick={() => update("style", style as GameStyle)}
                  className="text-xs"
                >
                  {GAME_STYLE_LABELS[style]}
                </OptionButton>
              ))}
            </div>
          </fieldset>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-paper-light shadow-[0_12px_28px_-16px_rgba(23,42,34,0.8)] transition duration-200 hover:bg-forest-soft active:translate-y-px"
        >
          See the shortlist
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="sr-only" aria-live="polite">
          {recommendations.length} recommendations available.
        </p>
      </form>

      <div ref={resultsRef} className="scroll-mt-24" aria-live="polite">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="eyebrow">Your shortlist</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-forest sm:text-3xl">
              {recommendations.length > 0
                ? `${recommendations.length} ${recommendations.length === 1 ? "game fits" : "games fit"} the room.`
                : "Nothing fits all of that — yet."}
            </h2>
            <p className="mt-2 text-xs font-semibold text-ink-faint">
              {preferences.players} people · {OCCASION_LABELS[preferences.occasion]} · up to{" "}
              {formatDuration(preferences.minutes)} ·{" "}
              {preferences.format === "all" ? "in person or online" : preferences.format === "offline" ? "in person" : "online"}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-forest/60 underline decoration-forest/20 underline-offset-4 hover:text-forest"
          >
            <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>

        {recommendations.length > 0 ? (
          <div key={resetCount} className="mt-6 space-y-4">
            {recommendations.map((recommendation, index) => (
              <Link
                key={recommendation.game.slug}
                href={recommendation.game.href}
                className="group grid overflow-hidden rounded-panel border border-line bg-paper-light shadow-soft transition duration-300 ease-soft hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-lifted sm:grid-cols-[11.5rem_1fr]"
              >
                <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto sm:min-h-[12.5rem]">
                  <GameArt theme={recommendation.game.artTheme} title={recommendation.game.title} />
                  <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-paper-light/85 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-forest backdrop-blur-sm">
                    {index === 0 ? "Top pick" : `Match ${index + 1}`}
                  </span>
                </div>
                <div className="flex flex-col p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-terracotta-deep">
                        {recommendation.game.format === "online" ? "Online · Party Trivia" : "In person"}
                      </p>
                      <h3 className="mt-1.5 font-display text-xl font-semibold leading-tight text-forest sm:text-2xl">
                        {recommendation.game.title}
                      </h3>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-forest/15 text-forest transition-colors group-hover:border-forest group-hover:bg-forest group-hover:text-paper-light">
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{recommendation.game.description}</p>
                  <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5">
                    {recommendation.reasons.map((reason) => (
                      <span key={reason} className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-forest/65">
                        <Check className="h-3 w-3 text-sage-deep" aria-hidden="true" />
                        {reason}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line/70 pt-3 text-[0.68rem] font-semibold text-ink-faint">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3 w-3" aria-hidden="true" />
                      {formatPlayers(recommendation.game.minPlayers, recommendation.game.maxPlayers)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3 w-3" aria-hidden="true" />
                      {formatDuration(recommendation.game.durationMinutes)}
                    </span>
                    <span>Ages {recommendation.game.minAge}+</span>
                  </div>
                  {recommendation.note ? (
                    <p className="mt-3 rounded-lg bg-amber-light/40 px-3 py-2 text-[0.7rem] font-medium leading-relaxed text-forest/75">
                      {recommendation.note}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}

            {recommendations.length < 4 ? (
              <p className="rounded-xl border border-dashed border-forest/15 px-4 py-3 text-xs leading-relaxed text-ink-faint">
                We only show games that meet every hard constraint — player count, age, available
                time, format, and occasion. A shorter list is a better answer than a padded one.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 flex min-h-[24rem] flex-col items-center justify-center rounded-panel border border-dashed border-forest/20 bg-white/35 px-5 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/30 text-forest">
              <SearchX className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-semibold text-forest">Try widening one thing.</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              There is no game in the library that fits all of those constraints at once. Give the
              group more time, include online play, or choose a different mood.
            </p>
            <div className="mt-5 flex flex-col gap-2 min-[420px]:flex-row">
              <Button variant="secondary" size="sm" onClick={() => update("style", "any")}>
                Any mood
              </Button>
              <Button variant="secondary" size="sm" onClick={() => update("minutes", 120)}>
                Allow two hours
              </Button>
              <Button variant="primary" size="sm" onClick={reset}>
                Reset everything
              </Button>
            </div>
          </div>
        )}

        <div className="mt-10 rounded-panel border border-line bg-forest/[0.035] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/60 text-forest">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-forest">How matching works</h2>
              <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-ink-soft">
                No AI, no guesswork. We first keep games that fit the number of players, the
                youngest player&apos;s age, your available time, online/in-person format, and the
                occasion you picked. Then we prioritise your chosen mood and shortest fit. If the
                exact mood is not available, we say so rather than pretending it matched.
              </p>
              <p className="mt-2 text-[0.68rem] font-semibold text-forest/50">
                {noStyleMatch
                  ? "This shortlist includes a fallback because no exact mood match was available."
                  : "Every reason shown above comes from the game's own tags and constraints."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
