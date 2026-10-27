export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          slug: string;
          title: string;
          short_description: string;
          description: string;
          game_type: string;
          format: "offline" | "online";
          min_players: number;
          max_players: number;
          min_age: number;
          estimated_duration_minutes: number;
          occasions: string[];
          styles: string[];
          materials: string[];
          setup: string | null;
          rules: Json;
          how_to_win: string | null;
          variations: Json;
          host_tip: string | null;
          difficulty: string;
          art_theme: string;
          featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          short_description: string;
          description: string;
          game_type: string;
          format?: "offline" | "online";
          min_players: number;
          max_players: number;
          min_age: number;
          estimated_duration_minutes: number;
          occasions?: string[];
          styles?: string[];
          materials?: string[];
          setup?: string | null;
          rules?: Json;
          how_to_win?: string | null;
          variations?: Json;
          host_tip?: string | null;
          difficulty?: string;
          art_theme?: string;
          featured?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["games"]["Insert"]>;
        Relationships: [];
      };
      favorites: {
        Row: {
          user_id: string;
          game_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          game_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      game_plays: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          played_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          played_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      game_rooms: {
        Row: {
          id: string;
          room_code: string;
          host_user_id: string;
          status: "lobby" | "question" | "reveal" | "results" | "closed";
          current_question_index: number;
          question_ids: string[];
          question_started_at: string | null;
          question_ends_at: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
          expires_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      room_players: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          display_name: string;
          score: number;
          joined_at: string;
          last_seen_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      trivia_questions: {
        Row: {
          id: string;
          question: string;
          category: string;
          difficulty: string;
          options: Json;
          correct_option_index: number;
          explanation: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      trivia_answers: {
        Row: {
          id: string;
          room_id: string;
          player_id: string;
          question_index: number;
          selected_option_index: number;
          is_correct: boolean;
          points_awarded: number;
          response_time_ms: number;
          is_scored: boolean;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_trivia_room: {
        Args: {
          p_display_name?: string | null;
          p_max_players?: number;
          p_question_count?: number;
          p_question_seconds?: number;
        };
        Returns: Array<{ room_id: string; room_code: string }>;
      };
      join_trivia_room: {
        Args: { p_room_code: string };
        Returns: Array<{ room_id: string; room_code: string }>;
      };
      get_trivia_room_state: {
        Args: { p_room_id: string };
        Returns: Json;
      };
      start_trivia_game: {
        Args: { p_room_id: string };
        Returns: Json;
      };
      reveal_trivia_question: {
        Args: { p_room_id: string };
        Returns: Json;
      };
      advance_trivia_room: {
        Args: { p_room_id: string };
        Returns: Json;
      };
      submit_trivia_answer: {
        Args: { p_room_id: string; p_selected_option_index: number };
        Returns: Json;
      };
      restart_trivia_room: {
        Args: { p_room_id: string };
        Returns: Json;
      };
      leave_trivia_room: {
        Args: { p_room_id: string };
        Returns: Json;
      };
    };
    Enums: {
      room_status: "lobby" | "question" | "reveal" | "results" | "closed";
    };
    CompositeTypes: Record<string, never>;
  };
}
