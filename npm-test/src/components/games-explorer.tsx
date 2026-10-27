"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  GAME_TYPES,
  GAME_TYPE_LABELS,
  OCCASIONS,
  OCCASION_LABELS,
  PLAYER_AGE_GROUPS,
  games,
  type GameType,
  type Occasion,
} from "@/data/games";
import {
  EXPLORER_DEFAULTS,
  activeFilterCount,
  filterGames,
  type ExplorerFilters as Filters,
} from "@/lib/matching";
import { cn } from "@/lib/utils";

const durationOptions = [
  { value: "", label: "Any length" },
  { value: "short", label: "Under 30 min" },
  { value: "medium", label: "30–60 min" },
  { value: "long", label: "Over 60 min" },
] as const;

const sortOptions = [
  { value: "name", label: "A–Z" },
  { value: "duration-asc", label: "Shortest first" },
  { value: "duration-desc", label: "Longest first" },
] as const;

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <select id={id} className="select-base" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterPanel({
  idPrefix,
  filters,
  update,
  clear,
  isActive,
}: {
  idPrefix: string;
  filters: Filters;
  update: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  clear: () => void;
  isActive: boolean;
}) {
  return (
    <div className="space-y-7">
      <div>
        <p className="field-label">Group size</p>
        <div className="flex items-center gap-2">
          <select
            id={`${idPrefix}-players`}
            className="select-base"
            value={filters.players ?? ""}
            onChange={(event) => update("players", event.target.value ? Number(event.target.value) : null)}
            aria-label="Number of players"
          >
            <option value="">Any group size</option>
            {Array.from({ length: 19 }, (_, index) => index + 2).map((count) => (
              <option key={count} value={count}>
                {count} players
              </option>
            ))}
          </select>
        </div>
        <p className="field-hint">Shows games that work for exactly this many people.</p>
      </div>

      <fieldset>
        <legend className="field-label">Suitable for</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="chip min-h-10 px-3 text-xs"
            data-selected={!filters.ageGroup}
            aria-pressed={!filters.ageGroup}
            onClick={() => update("ageGroup", "")}
          >
            All ages
          </button>
          {PLAYER_AGE_GROUPS.map((group) => (
            <button
              key={group.value}
              type="button"
              className="chip min-h-10 px-3 text-xs"
              data-selected={filters.ageGroup === group.value}
              aria-pressed={filters.ageGroup === group.value}
              onClick={() => update("ageGroup", group.value)}
              title={group.description}
            >
              {group.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="field-label">Time available</legend>
        <div className="grid grid-cols-2 gap-2">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className="chip min-h-10 justify-start px-3 text-xs"
              data-selected={filters.duration === option.value}
              aria-pressed={filters.duration === option.value}
              onClick={() => update("duration", option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <SelectField
        id={`${idPrefix}-occasion`}
        label="Occasion"
        value={filters.occasion}
        options={[
          { value: "", label: "Any occasion" },
          ...OCCASIONS.map((occasion) => ({ value: occasion, label: OCCASION_LABELS[occasion] })),
        ]}
        onChange={(value) => update("occasion", value as Occasion | "")}
      />

      <SelectField
        id={`${idPrefix}-type`}
        label="Game type"
        value={filters.type}
        options={[
          { value: "", label: "Every type" },
          ...GAME_TYPES.map((type) => ({ value: type, label: GAME_TYPE_LABELS[type] })),
        ]}
        onChange={(value) => update("type", value as GameType | "")}
      />

      <div className="rounded-xl bg-forest/5 px-3.5 py-3">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-forest/55">Teachability</p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
          {DIFFICULTIES.map((difficulty) => (
            <span key={difficulty}>
              {DIFFICULTY_LABELS[difficulty]}:{" "}
              <strong className="font-semibold text-forest">
                {games.filter((game) => game.difficulty === difficulty).length}
              </strong>
            </span>
          ))}
        </div>
      </div>

      {isActive ? (
        <Button variant="secondary" size="sm" onClick={clear} className="w-full">
          Clear all filters
        </Button>
      ) : null}
    </div>
  );
}

export function GamesExplorer({ initialOccasion }: { initialOccasion?: Occasion }) {
  const [filters, setFilters] = useState<Filters>({
    ...EXPLORER_DEFAULTS,
    occasion: initialOccasion ?? "",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => filterGames(filters, games), [filters]);
  const activeCount = activeFilterCount(filters);
  const isActive = activeCount > 0;

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clear() {
    setFilters({ ...EXPLORER_DEFAULTS });
  }

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <label htmlFor="game-search" className="sr-only">
            Search games
          </label>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/45"
            aria-hidden="true"
          />
          <input
            id="game-search"
            type="search"
            value={filters.query}
            onChange={(event) => update("query", event.target.value)}
            placeholder="Search by game, mood, or material…"
            className="input-base pl-11 pr-11"
            autoComplete="off"
          />
          {filters.query ? (
            <button
              type="button"
              onClick={() => update("query", "")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-forest/50 hover:bg-forest/8 hover:text-forest"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            aria-expanded={filtersOpen}
            aria-controls="mobile-filters"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-forest/20 bg-white/55 px-4 text-sm font-semibold text-forest lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            {activeCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-forest px-1.5 text-[0.65rem] font-bold text-paper-light">
                {activeCount}
              </span>
            ) : null}
          </button>

          <div className="flex min-h-11 items-center gap-2">
            <label htmlFor="sort-games" className="text-xs font-bold uppercase tracking-[0.08em] text-ink-faint">
              Sort
            </label>
            <select
              id="sort-games"
              value={filters.sort}
              onChange={(event) => update("sort", event.target.value as Filters["sort"])}
              className="min-h-11 rounded-xl border border-forest/20 bg-white/55 px-3 text-sm font-semibold text-forest"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[17.5rem_1fr] lg:gap-10">
        <aside className="hidden lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:block">
          <div className="rounded-panel border border-line bg-paper-light/65 p-5 shadow-soft backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-forest">Refine the shelf</h2>
              {isActive ? (
                <button type="button" onClick={clear} className="text-xs font-bold text-terracotta-deep hover:underline">
                  Reset
                </button>
              ) : null}
            </div>
            <FilterPanel
              idPrefix="desktop"
              filters={filters}
              update={update}
              clear={clear}
              isActive={isActive}
            />
          </div>
        </aside>

        {filtersOpen ? (
          <div id="mobile-filters" className="rounded-panel border border-line bg-paper-light p-5 shadow-soft lg:hidden">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-forest">Refine the shelf</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-forest/60"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Close
              </button>
            </div>
            <FilterPanel
              idPrefix="mobile"
              filters={filters}
              update={update}
              clear={clear}
              isActive={isActive}
            />
          </div>
        ) : null}

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-forest" aria-live="polite">
              {results.length} {results.length === 1 ? "game" : "games"}
              {filters.query ? <span className="font-normal text-ink-faint"> for &ldquo;{filters.query}&rdquo;</span> : null}
            </p>
            {filters.occasion ? (
              <p className="text-xs font-semibold text-ink-faint">
                Filtered for: {OCCASION_LABELS[filters.occasion]}
              </p>
            ) : null}
          </div>

          {results.length > 0 ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((game) => (
                <GameCard key={game.slug} game={game} />
              ))}
            </div>
          ) : (
            <div className="mt-5 flex min-h-[22rem] flex-col items-center justify-center rounded-panel border border-dashed border-forest/20 bg-white/35 px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/30 text-forest">
                <Search className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-semibold text-forest">No games match that combination.</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                Try a larger time window, a wider age range, or fewer people. Or clear the filters
                and start with the whole shelf.
              </p>
              <Button onClick={clear} variant="secondary" className="mt-5">
                Clear filters
              </Button>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between gap-4 rounded-panel border border-line bg-forest/5 px-5 py-4">
            <div>
              <p className="text-sm font-bold text-forest">Prefer a recommendation?</p>
              <p className="mt-0.5 text-xs text-ink-soft">Six questions, matched to the real catalogue.</p>
            </div>
            <Link
              href="/finder"
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-xs font-bold text-forest underline decoration-forest/25 underline-offset-4 hover:decoration-forest"
            >
              Game finder
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
