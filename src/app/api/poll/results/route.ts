import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseRouteHandler, requireUser } from "@/lib/auth";
import { isDemoMode, hasSupabaseConfig } from "@/lib/env";
import { getDemoPollPercentages } from "@/lib/mock";

const QuerySchema = z.object({
  challengeId: z.string().uuid()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = QuerySchema.safeParse({ challengeId: searchParams.get("challengeId") });
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige poll" }, { status: 400 });
  }

  if (isDemoMode() || !hasSupabaseConfig()) {
    return NextResponse.json(getDemoPollPercentages(parsed.data.challengeId));
  }

  await requireUser();
  const supabase = getSupabaseRouteHandler();
  const { data: challenge } = await supabase
    .from("challenges")
    .select("content, type")
    .eq("id", parsed.data.challengeId)
    .single();
  if (!challenge || challenge.type !== "poll") {
    return NextResponse.json({ error: "Poll niet gevonden" }, { status: 404 });
  }
  const options = (challenge.content as { options?: string[] } | null)?.options ?? [];
  const { data: votes } = await supabase
    .from("poll_votes")
    .select("choice")
    .eq("challenge_id", parsed.data.challengeId);
  const totals: Record<number, number> = {};
  votes?.forEach((vote) => {
    totals[vote.choice] = (totals[vote.choice] ?? 0) + 1;
  });
  const total = Object.values(totals).reduce((acc, val) => acc + val, 0) || 1;
  const percentages = options.map((_, idx) => Math.round(((totals[idx] ?? 0) / total) * 100));
  return NextResponse.json({ percentages });
}
