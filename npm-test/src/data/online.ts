import type { ArtTheme, GameStyle, GameType, Occasion, OfflineGame } from "@/data/games";
import { games } from "@/data/games";

export interface DiscoveryGame {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  type: GameType;
  format: "offline" | "online";
  minPlayers: number;
  maxPlayers: number;
  minAge: number;
  durationMinutes: number;
  occasions: Occasion[];
  styles: GameStyle[];
  href: string;
  artTheme: ArtTheme;
}

export interface OnlineGame extends DiscoveryGame {
  format: "online";
  features: string[];
  setupTime: string;
}

export const partyTrivia: OnlineGame = {
  slug: "party-trivia",
  title: "Party Trivia",
  tagline: "One host. Everyone's phone. Eight quick-fire questions.",
  description:
    "Create a room, share the code, and race through a live round of multiple-choice trivia. The leaderboard updates after every question — no app download required.",
  type: "trivia",
  format: "online",
  minPlayers: 2,
  maxPlayers: 10,
  minAge: 13,
  durationMinutes: 15,
  occasions: [
    "house-party",
    "birthday",
    "sleepover",
    "family-gathering",
    "college-event",
    "festive-gathering",
    "casual-hangout",
  ],
  styles: ["trivia", "funny", "relaxed"],
  href: "/online/trivia",
  artTheme: "buzzer",
  features: [
    "Live rooms for 2–10 players",
    "Share by six-character room code or link",
    "Server-scored answers with a visible leaderboard",
    "A host-controlled path from lobby to results",
  ],
  setupTime: "About 2 minutes to gather everyone",
};

export function offlineGameToDiscovery(game: OfflineGame): DiscoveryGame {
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

export const discoveryGames: DiscoveryGame[] = [
  ...games.map(offlineGameToDiscovery),
  partyTrivia,
];
