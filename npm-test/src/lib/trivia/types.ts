export type RoomStatus = "lobby" | "question" | "reveal" | "results" | "closed";

export interface TriviaPlayer {
  player_id: string;
  user_id: string;
  display_name: string;
  score: number;
  correct_count: number;
  is_host: boolean;
  joined_at: string;
  last_seen_at: string;
}

export interface TriviaQuestionState {
  index: number;
  total: number;
  category: string;
  difficulty: string;
  prompt: string;
  options: string[];
  ends_at: string | null;
  started_at: string | null;
  correct_option_index: number | null;
  explanation: string | null;
  my_answer: number | null;
  answered_count: number;
  option_counts: number[] | null;
}

export interface RoomInfo {
  id: string;
  room_code: string;
  status: RoomStatus;
  host_user_id: string;
  current_question_index: number;
  question_count: number;
  question_seconds: number;
  max_players: number;
  question_started_at: string | null;
  question_ends_at: string | null;
  created_at: string;
  expires_at: string;
}

export interface TriviaRoomState {
  server_now: string;
  room: RoomInfo;
  players: TriviaPlayer[];
  my_player_id: string;
  is_host: boolean;
  question: TriviaQuestionState | null;
}

export interface CreateRoomResult {
  room_id: string;
  room_code: string;
}

export interface JoinRoomResult {
  room_id: string;
  room_code: string;
}

export interface RealtimeStatus {
  connected: boolean;
  label: string;
}
