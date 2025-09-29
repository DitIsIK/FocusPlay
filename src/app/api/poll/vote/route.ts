import { NextResponse } from "next/server";
import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";
import { PollVoteSchema } from "@/types/challenge";

export async function POST(request: Request) {
  const body = await request.json();
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ percentages: [50, 50], xpAwarded: 5 });
  }
  const user = await requireUser();
  const parsed = PollVoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige stem" }, { status: 400 });
  }
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
  if (!existing) {
    const { data: profile } = await supabase.from("users").select("xp").eq("id", user.id).single();
    await supabase.from("users").update({ xp: (profile?.xp ?? 0) + 5 }).eq("id", user.id);
  }
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
  return NextResponse.json({ percentages, xpAwarded: existing ? 0 : 5 });
}
