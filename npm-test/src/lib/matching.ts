import {
  GAME_STYLE_LABELS,
  OCCASION_LABELS,
  type GameStyle,
  type GameType,
  type Occasion,
  type OfflineGame,
} from "@/data/games";
import { discoveryGames, type DiscoveryGame } from "@/data/online";
import { formatDuration, formatPlayers } from "@/data/games";

export interface FinderPreferences {
  occasion: Occasion;
  players: number;
  ageGroup: "8" | "13" | "18";
  minutes: 15 | 30 | 45 | 60 | 120;
  format: "all" | "offline" | "online";
  style: GameStyle | "any";
}

export const FINDER_DEFAULTS: FinderPreferences = {
  occasion: "casual-hangout",
  players: 6,
  ageGroup: "13",
  minutes: 60,
  format: "all",
  style: "any",
};

export interface Recommendation {
  game: DiscoveryGame;
  reasons: string[];
  note?: string;
  score: number;
}

export function matchesPlayerCount(game: { minPlayers: number; maxPlayers: number }, players: number): boolean {
  return players >= game.minPlayers && players <= game.maxPlayers;
}

export function matchesAge(game: { minAge: number }, ageGroup: string): boolean {
  if (!ageGroup) return true;
  const limit = Number(ageGroup);
  return Number.isFinite(limit) && game.minAge <= limit;
}

export function getRecommendations(
  preferences: FinderPreferences,
  catalogue: DiscoveryGame[] = discoveryGames,
): Recommendation[] {
  const hardMatches = catalogue.filter(
    (game) =>
      (preferences.format === "all" || game.format === preferences.format) &&
      matchesPlayerCount(game, preferences.players) &&
      matchesAge(game, preferences.ageGroup) &&
      game.durationMinutes <= preferences.minutes &&
      game.occasions.includes(preferences.occasion),
  );

  const styleMatches = hardMatches.filter(
    (game) => preferences.style === "any" || game.styles.includes(preferences.style),
  );

  const pool = styleMatches.length > 0 ? styleMatches : hardMatches;
  const requestedStyle = preferences.style;
  const requestedStyleLabel =
    requestedStyle === "any" ? null : GAME_STYLE_LABELS[requestedStyle];
  const noStyleMatch = requestedStyleLabel !== null && styleMatches.length === 0;

  const scored = pool.map((game) => {
    const reasons = [
      ...(requestedStyle !== "any" && game.styles.includes(requestedStyle)
        ? [`${GAME_STYLE_LABELS[requestedStyle]} energy`]
        : []),
      ...(game.format === "online" ? ["Everyone plays from their own phone"] : []),
      formatPlayers(game.minPlayers, game.maxPlayers),
      `Suitable for ages ${game.minAge}+`,
      `About ${formatDuration(game.durationMinutes)}`,
      `A fit for ${OCCASION_LABELS[preferences.occasion].toLowerCase()}`,
    ];

    let score = 0;

    if (game.styles.includes("funny")) score += 1;
    if (requestedStyle !== "any" && game.styles.includes(requestedStyle)) {
      score += 4;
    }
    if (game.format === "online") {
      score += 2;
    }
    if (preferences.minutes - game.durationMinutes >= 30) {
      score += 1;
    }

    return {
      game,
      reasons: reasons.slice(0, 4),
      note:
        noStyleMatch && requestedStyleLabel
          ? `No exact ${requestedStyleLabel.toLowerCase()} match for this combination, so here is the closest fit.`
          : undefined,
      score,
    } satisfies Recommendation;
  });

  return scored
    .sort((a, b) => b.score - a.score || a.game.durationMinutes - b.game.durationMinutes || a.game.title.localeCompare(b.game.title))
    .slice(0, 4);
}

export interface ExplorerFilters {
  query: string;
  players: number | null;
  ageGroup: string;
  duration: "" | "short" | "medium" | "long";
  occasion: Occasion | "";
  type: GameType | "";
  sort: "name" | "duration-asc" | "duration-desc";
}

export const EXPLORER_DEFAULTS: ExplorerFilters = {
  query: "",
  players: null,
  ageGroup: "",
  duration: "",
  occasion: "",
  type: "",
  sort: "name",
};

export function filterGames(
  filters: ExplorerFilters,
  catalogue: OfflineGame[],
): OfflineGame[] {
  const query = filters.query.trim().toLowerCase();

  return catalogue
    .filter((game) => {
      if (query) {
        const haystack = [game.title, game.description, game.tagline, game.type, ...game.materials, ...game.styles]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (filters.players !== null && !matchesPlayerCount(game, filters.players)) {
        return false;
      }

      if (filters.ageGroup && !matchesAge(game, filters.ageGroup)) {
        return false;
      }

      if (filters.duration === "short" && game.durationMinutes >= 30) return false;
      if (filters.duration === "medium" && (game.durationMinutes < 30 || game.durationMinutes > 60)) return false;
      if (filters.duration === "long" && game.durationMinutes <= 60) return false;

      if (filters.occasion && !game.occasions.includes(filters.occasion)) return false;
      if (filters.type && game.type !== filters.type) return false;

      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "duration-asc") return a.durationMinutes - b.durationMinutes || a.title.localeCompare(b.title);
      if (filters.sort === "duration-desc") return b.durationMinutes - a.durationMinutes || a.title.localeCompare(b.title);
      return a.title.localeCompare(b.title);
    });
}

export function activeFilterCount(filters: ExplorerFilters): number {
  let count = 0;
  if (filters.query.trim()) count += 1;
  if (filters.players !== null) count += 1;
  if (filters.ageGroup) count += 1;
  if (filters.duration) count += 1;
  if (filters.occasion) count += 1;
  if (filters.type) count += 1;
  return count;
}
