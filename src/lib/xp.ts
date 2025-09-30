import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export type ChallengeType = "quiz" | "poll" | "fact";

export function xpForAction(type: ChallengeType, correct = false) {
  switch (type) {
    case "quiz":
      return correct ? 10 : 0;
    case "poll":
      return 5;
    case "fact":
      return 3;
    default:
      return 0;
  }
}

function getUtcDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function nextStreakValue(current: number, lastDate: string | null) {
  const today = getUtcDate(new Date());
  const todayIso = today.toISOString().slice(0, 10);

  if (!lastDate) {
    return { streak: Math.max(current, 0) + 1, lastDate: todayIso };
  }

  const previous = new Date(`${lastDate}T00:00:00Z`);
  const diffDays = Math.floor((today.getTime() - previous.getTime()) / 86_400_000);

  if (diffDays <= 0) {
    return { streak: current || 1, lastDate };
  }

  if (diffDays === 1) {
    return { streak: current + 1, lastDate: todayIso };
  }

  return { streak: 1, lastDate: todayIso };
}

export async function awardXp({
  supabase,
  userId,
  amount
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  amount: number;
}) {
  const { data: profile } = await supabase
    .from("users")
    .select("xp, streak_days, last_streak_date")
    .eq("id", userId)
    .single();

  const currentXp = profile?.xp ?? 0;
  const currentStreak = profile?.streak_days ?? 0;
  const lastDate = profile?.last_streak_date ?? null;

  if (amount <= 0) {
    return { newXP: currentXp, streak: currentStreak, xpDelta: 0 };
  }

  const { streak, lastDate: updatedDate } = nextStreakValue(currentStreak, lastDate);
  const newXP = currentXp + amount;

  await supabase
    .from("users")
    .update({
      xp: newXP,
      streak_days: streak,
      last_streak_date: updatedDate,
      last_action: new Date().toISOString()
    })
    .eq("id", userId);

  return { newXP, streak, xpDelta: amount };
}
