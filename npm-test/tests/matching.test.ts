import assert from "node:assert/strict";
import test from "node:test";
import type { OfflineGame } from "@/data/games";
import type { DiscoveryGame } from "@/data/online";
import {
  activeFilterCount,
  EXPLORER_DEFAULTS,
  filterGames,
  getRecommendations,
  matchesAge,
  matchesPlayerCount,
  type ExplorerFilters,
  type FinderPreferences,
} from "@/lib/matching";

function makeGame(overrides: Partial<OfflineGame> = {}): OfflineGame {
  return {
    slug: "test-game",
    title: "Test Game",
    tagline: "A test.",
    description: "A game used by the unit tests.",
    type: "icebreaker",
    format: "offline",
    minPlayers: 2,
    maxPlayers: 8,
    minAge: 8,
    durationMinutes: 30,
    difficulty: "easy",
    occasions: ["casual-hangout"],
    styles: ["funny"],
    materials: ["Paper", "Pens"],
    setup: "Set it up.",
    rules: [{ title: "Play", detail: "Have fun." }],
    howToWin: "Score the most points.",
    variations: ["Change the timer."],
    hostTip: "Keep it moving.",
    artTheme: "paper",
    ...overrides,
  };
}

function asDiscovery(game: OfflineGame): DiscoveryGame {
  return {
    slug: game.slug,
    title: game.title,
    tagline: game.tagline,
    description: game.description,
    type: game.type,
    format: "offline",
    minPlayers: game.minPlayers,
    maxPlayers: game.maxPlayers,
    minAge: game.minAge,
    durationMinutes: game.durationMinutes,
    occasions: game.occasions,
    styles: game.styles,
    href: `/games/${game.slug}`,
    artTheme: game.artTheme,
  };
}

const defaults: FinderPreferences = {
  occasion: "casual-hangout",
  players: 6,
  ageGroup: "13",
  minutes: 60,
  format: "all",
  style: "any",
};

test("player-count matching is inclusive at both ends", () => {
  const bounds = { minPlayers: 3, maxPlayers: 8 };
  assert.equal(matchesPlayerCount(bounds, 2), false);
  assert.equal(matchesPlayerCount(bounds, 3), true);
  assert.equal(matchesPlayerCount(bounds, 8), true);
  assert.equal(matchesPlayerCount(bounds, 9), false);
});

test("age matching treats the selected age as a maximum", () => {
  assert.equal(matchesAge({ minAge: 13 }, "8"), false);
  assert.equal(matchesAge({ minAge: 13 }, "13"), true);
  assert.equal(matchesAge({ minAge: 13 }, "18"), true);
  assert.equal(matchesAge({ minAge: 13 }, ""), true);
});

test("recommendations respect format, players, age, time and occasion", () => {
  const catalogue = [
    asDiscovery(makeGame({ slug: "fits", title: "Fits" })),
    asDiscovery(makeGame({ slug: "too-long", title: "Too Long", durationMinutes: 120 })),
    asDiscovery(makeGame({ slug: "too-small", title: "Too Small", maxPlayers: 4 })),
    asDiscovery(makeGame({ slug: "too-old", title: "Too Old", minAge: 18 })),
    asDiscovery(makeGame({ slug: "wrong-occasion", title: "Wrong Occasion", occasions: ["sleepover"] })),
  ];

  const results = getRecommendations(defaults, catalogue);
  assert.deepEqual(results.map((result) => result.game.slug), ["fits"]);
});

test("recommendations use the requested style first and cap at four", () => {
  const catalogue = [
    asDiscovery(makeGame({ slug: "a", title: "A", styles: ["relaxed"] })),
    asDiscovery(makeGame({ slug: "b", title: "B", styles: ["creative"] })),
    asDiscovery(makeGame({ slug: "c", title: "C", styles: ["creative"] })),
    asDiscovery(makeGame({ slug: "d", title: "D", styles: ["creative"] })),
    asDiscovery(makeGame({ slug: "e", title: "E", styles: ["creative"] })),
  ];

  const results = getRecommendations({ ...defaults, style: "creative" }, catalogue);
  assert.equal(results.length, 4);
  assert.equal(results[0]?.game.slug, "b");
  assert.equal(results[0]?.note, undefined);
  assert.ok(results[0]?.reasons.includes("Creative energy"));
});

test("recommendations explain when the style filter has no match", () => {
  const catalogue = [
    asDiscovery(makeGame({ slug: "calm", title: "Calm", styles: ["relaxed"] })),
  ];

  const [result] = getRecommendations({ ...defaults, style: "strategic" }, catalogue);
  assert.equal(result?.game.slug, "calm");
  assert.match(result?.note ?? "", /No exact strategic match/i);
});

test("recommendations return an empty list when nothing hard-matches", () => {
  const catalogue = [asDiscovery(makeGame({ slug: "short", title: "Short", durationMinutes: 15 }))];
  assert.deepEqual(getRecommendations({ ...defaults, minutes: 15, players: 2, occasion: "sleepover" }, catalogue), []);
});

const filters: ExplorerFilters = { ...EXPLORER_DEFAULTS };
const filterCatalogue = [
  makeGame({
    slug: "alpha",
    title: "Alpha",
    durationMinutes: 15,
    type: "icebreaker",
    materials: ["Sticky notes"],
    occasions: ["house-party"],
  }),
  makeGame({
    slug: "bravo",
    title: "Bravo",
    durationMinutes: 45,
    type: "trivia",
    minAge: 13,
    materials: ["Paper"],
    occasions: ["casual-hangout"],
  }),
  makeGame({
    slug: "charlie",
    title: "Charlie",
    durationMinutes: 90,
    type: "roleplay",
    minAge: 18,
    materials: ["Candles"],
    occasions: ["festive-gathering"],
  }),
];

test("the explorer search covers titles, descriptions, materials and styles", () => {
  const title = filterGames({ ...filters, query: "brav" }, filterCatalogue);
  assert.deepEqual(title.map((game) => game.slug), ["bravo"]);

  const material = filterGames({ ...filters, query: "sticky" }, filterCatalogue);
  assert.deepEqual(material.map((game) => game.slug), ["alpha"]);

  const style = filterGames({ ...filters, query: "funny" }, filterCatalogue);
  assert.equal(style.length, 3);
});

test("the explorer filters combine duration, age, occasion and type", () => {
  assert.deepEqual(
    filterGames({ ...filters, duration: "short" }, filterCatalogue).map((game) => game.slug),
    ["alpha"],
  );
  assert.deepEqual(
    filterGames({ ...filters, duration: "medium", ageGroup: "13" }, filterCatalogue).map((game) => game.slug),
    ["bravo"],
  );
  assert.deepEqual(
    filterGames({ ...filters, occasion: "festive-gathering", type: "roleplay" }, filterCatalogue).map(
      (game) => game.slug,
    ),
    ["charlie"],
  );
  assert.deepEqual(
    filterGames({ ...filters, players: 6 }, filterCatalogue).map((game) => game.slug),
    ["alpha", "bravo", "charlie"],
  );
});

test("the explorer sorts by title and duration", () => {
  assert.deepEqual(
    filterGames({ ...filters, sort: "duration-desc" }, filterCatalogue).map((game) => game.slug),
    ["charlie", "bravo", "alpha"],
  );
  assert.deepEqual(
    filterGames({ ...filters, sort: "duration-asc" }, filterCatalogue).map((game) => game.slug),
    ["alpha", "bravo", "charlie"],
  );
});

test("the active filter count ignores sort order and empty values", () => {
  assert.equal(activeFilterCount({ ...filters, sort: "duration-desc" }), 0);
  assert.equal(
    activeFilterCount({
      ...filters,
      query: "  ",
      duration: "short",
      type: "trivia",
      players: 4,
    }),
    3,
  );
});
