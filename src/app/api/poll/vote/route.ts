import { NextResponse } from "next/server";
import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";
import { PollVoteSchema } from "@/types/challenge";
import { awardXp } from "@/lib/xp";
import { isDemoMode, hasSupabaseConfig } from "@/lib/env";
import { voteDemoPoll } from "@/lib/mock";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = PollVoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige stem" }, { status: 400 });
  }
  if (isDemoMode() || !hasSupabaseConfig()) {
    const result = voteDemoPoll(parsed.data.challengeId, parsed.data.choice);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json(result);
  }
  const user = await requireUser();
  const supabase = getSupabaseRouteHandler();
  const { data: challenge } = await supabase.from("challenges").select("*").eq("id", parsed.data.challengeId).single();
  if (!challenge || challenge.type !== "poll") {
    return NextResponse.json({ error: "Poll niet gevonden" }, { status: 404 });
  }
  const options = (challenge.content as { options?: string[] } | null)?.options ?? [];
  const { data: existing } = await supabase
    .from("poll_votes")
    .select("id")
    .eq("challenge_id", parsed.data.challengeId)
    .eq("user_id", user.id)
    .maybeSingle();
  await supabase.from("poll_votes").upsert({
    challenge_id: parsed.data.challengeId,
    user_id: user.id,
    choice: parsed.data.choice
  });
  const { newXP, xpDelta } = await awardXp({
    supabase,
    userId: user.id,
    amount: existing ? 0 : 5
  });
  const { data: votes } = await supabase
    .from("poll_votes")
    .select("choice")
    .eq("challenge_id", parsed.data.challengeId);
  const totals: Record<number, number> = {};
  votes?.forEach((vote) => {
    totals[vote.choice] = (totals[vote.choice] ?? 0) + 1;
  });
  const total = Object.values(totals).reduce((acc, val) => acc + val, 0) || 1;
  const percentages = options.map((_, idx: number) =>
    Math.round(((totals[idx] ?? 0) / total) * 100)
  );
  return NextResponse.json({ percentages, xpAwarded: xpDelta, newXP });
}
