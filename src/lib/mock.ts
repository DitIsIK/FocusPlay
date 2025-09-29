import { Challenge } from "@/types/challenge";

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    type: "fact",
    theme: "general",
    content: {
      fact: "Koffie dempt adenosine — daardoor voelt slaap ver weg."
    },
    author: null,
    visibility: "global",
    created_at: new Date().toISOString()
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    type: "quiz",
    theme: "sports",
    content: {
      question: "Welke NBA speler heeft de meeste MVP’s?",
      options: ["Jordan", "LeBron", "Kareem", "Curry"],
      answerIndex: 2
    },
    author: null,
    visibility: "global",
    created_at: new Date().toISOString()
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    type: "poll",
    theme: "gaming",
    content: {
      question: "Controller vs. muis/keyboard?",
      options: ["Controller", "M/K"]
    },
    author: null,
    visibility: "global",
    created_at: new Date().toISOString()
  }
];

export const MOCK_PROFILE = {
  id: "00000000-0000-0000-0000-000000000000",
  email: "demo@focusplay.app",
  display_name: "demo",
  premium_tier: "free" as const,
  xp: 120,
  streak_days: 3,
  cards_consumed_today: 0,
  last_card_reset: new Date().toISOString()
};
