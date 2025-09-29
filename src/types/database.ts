export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          premium_tier: "free" | "premium" | "pro";
          xp: number;
          streak_days: number;
          last_action: string | null;
          cards_consumed_today: number | null;
          last_card_reset: string | null;
          stripe_customer_id: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      challenges: {
        Row: {
          id: string;
          type: "quiz" | "poll" | "fact";
          theme: string | null;
          content: Json;
          author: string | null;
          visibility: "global" | "friends";
          created_at: string;
        };
      };
      poll_votes: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          choice: number;
          created_at: string;
        };
      };
      friends: {
        Row: {
          user_a: string;
          user_b: string;
          status: "pending" | "accepted";
          created_at: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
