import type { Json } from "@/lib/supabase/types";
import type { TriviaRoomState } from "@/lib/trivia/types";

export function parseRoomState(value: Json | null): TriviaRoomState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const candidate = value as unknown as Partial<TriviaRoomState>;
  if (
    typeof candidate.server_now !== "string" ||
    !candidate.room ||
    typeof candidate.room.id !== "string" ||
    !Array.isArray(candidate.players) ||
    typeof candidate.my_player_id !== "string"
  ) {
    return null;
  }

  return candidate as TriviaRoomState;
}

export function actionErrorMessage(error: { message?: string } | null, fallback: string): string {
  const message = error?.message?.trim();
  if (!message) return fallback;

  if (message.includes("duplicate key") || message.includes("already")) {
    return "That action has already happened. Refreshing the room should catch you up.";
  }
  if (message.toLowerCase().includes("permission denied")) {
    return "Your account is not allowed to do that in this room.";
  }
  return message;
}
