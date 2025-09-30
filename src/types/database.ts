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
          last_streak_date: string | null;
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
          team_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["challenges"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["challenges"]["Row"]>;
      };
      poll_votes: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          choice: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["poll_votes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["poll_votes"]["Row"]>;
      };
      friends: {
        Row: {
          user_a: string;
          user_b: string;
          status: "pending" | "accepted";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["friends"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["friends"]["Row"]>;
      };
      fact_views: {
        Row: {
          user_id: string;
          challenge_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["fact_views"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["fact_views"]["Row"]>;
      };
      team_rooms: {
        Row: {
          id: string;
          name: string;
          theme: string;
          owner: string | null;
          invite_code: string;
          is_private: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["team_rooms"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["team_rooms"]["Row"]>;
      };
      team_members: {
        Row: {
          team_id: string;
          user_id: string;
          role: "owner" | "member";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["team_members"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["team_members"]["Row"]>;
      };
    };
    Views: {
      public_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          xp: number;
          streak_days: number;
          avatar_url: string | null;
        };
      };
    };
    Functions: {};
    Enums: {};
  };
}
