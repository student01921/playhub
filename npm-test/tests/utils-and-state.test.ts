import assert from "node:assert/strict";
import test from "node:test";
import type { Json } from "@/lib/supabase/types";
import { actionErrorMessage, parseRoomState } from "@/lib/trivia/state";
import { formatDate, getInitials, isValidRoomCode, normaliseRoomCode, pluralise, safeNextPath } from "@/lib/utils";

test("room codes keep only characters from the unambiguous alphabet", () => {
  assert.equal(normaliseRoomCode(" ab-cd ef "), "ABCDEF");
  assert.equal(normaliseRoomCode("O0I1L2"), "L2");
  assert.equal(normaliseRoomCode("abcdefghijkl"), "ABCDEF");
  assert.equal(normaliseRoomCode("£$%"), "");
});

test("room code validation requires exactly six allowed characters", () => {
  assert.equal(isValidRoomCode("ABCDEF"), true);
  assert.equal(isValidRoomCode("abcdef"), false);
  assert.equal(isValidRoomCode("ABCDE0"), false);
  assert.equal(isValidRoomCode("ABCDE"), false);
  assert.equal(isValidRoomCode("ABCDEFG"), false);
});

test("safe next paths stay inside the application", () => {
  assert.equal(safeNextPath("/games/charades"), "/games/charades");
  assert.equal(safeNextPath("/dashboard?tab=saved"), "/dashboard?tab=saved");
  assert.equal(safeNextPath("//evil.example"), "/dashboard");
  assert.equal(safeNextPath("https://evil.example"), "/dashboard");
  assert.equal(safeNextPath("\\\\evil.example"), "/dashboard");
  assert.equal(safeNextPath(null, "/login"), "/login");
});

test("initials, pluralisation and dates are presentation-safe", () => {
  assert.equal(getInitials("  Ada  Lovelace "), "AL");
  assert.equal(getInitials("Prince"), "PR");
  assert.equal(getInitials("   "), "?");
  assert.equal(pluralise(1, "game"), "1 game");
  assert.equal(pluralise(3, "game"), "3 games");
  assert.equal(formatDate("not-a-date"), "");
  assert.equal(formatDate("2026-10-27", { month: "short", day: "numeric" }), "Oct 27, 2026");
  assert.equal(formatDate("2026-10-27", { month: "short", day: "numeric", year: undefined }), "Oct 27");
});

test("parseRoomState accepts the expected room-state shape", () => {
  const state = {
    server_now: "2026-10-27T12:00:00.000Z",
    room: { id: "room-1" },
    players: [],
    my_player_id: "player-1",
    is_host: false,
    question: null,
  };

  assert.deepEqual(parseRoomState(state as unknown as Json), state);
});

test("parseRoomState rejects null, arrays and incomplete payloads", () => {
  assert.equal(parseRoomState(null), null);
  assert.equal(parseRoomState([] as unknown as Json), null);
  assert.equal(parseRoomState({} as Json), null);
  assert.equal(parseRoomState({ server_now: "now" } as Json), null);
  assert.equal(parseRoomState({ server_now: "now", room: {}, players: [], my_player_id: "p" } as Json), null);
  assert.equal(parseRoomState({ server_now: "now", room: { id: "r" }, players: {}, my_player_id: "p" } as Json), null);
});

test("action errors are translated only when the meaning is clear", () => {
  assert.equal(actionErrorMessage(null, "Try again"), "Try again");
  assert.equal(actionErrorMessage({ message: "  " }, "Try again"), "Try again");
  assert.match(actionErrorMessage({ message: "duplicate key value violates constraint" }, "Try again"), /already happened/);
  assert.match(actionErrorMessage({ message: "permission denied for function" }, "Try again"), /not allowed/);
  assert.equal(actionErrorMessage({ message: "ROOM_NOT_FOUND" }, "Try again"), "ROOM_NOT_FOUND");
});
