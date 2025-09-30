import { NextResponse } from "next/server";
import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";
import { QuizAnswerSchema } from "@/types/challenge";
import { awardXp } from "@/lib/xp";
import { isDemoMode, hasSupabaseConfig } from "@/lib/env";
import { answerDemoQuiz } from "@/lib/mock";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = QuizAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige input" }, { status: 400 });
  }
  if (isDemoMode() || !hasSupabaseConfig()) {
    const result = answerDemoQuiz(parsed.data.challengeId, parsed.data.answerIndex);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json(result);
  }
  const user = await requireUser();
  const supabase = getSupabaseRouteHandler();
  const { data: challenge } = await supabase.from("challenges").select("*").eq("id", parsed.data.challengeId).single();
  if (!challenge || challenge.type !== "quiz") {
    return NextResponse.json({ error: "Quiz niet gevonden" }, { status: 404 });
  }
  const content = challenge.content as { answerIndex?: number };
  const correct = content.answerIndex === parsed.data.answerIndex;
  const xpAwarded = correct ? 10 : 0;
  const { newXP, streak } = await awardXp({ supabase, userId: user.id, amount: xpAwarded });
  return NextResponse.json({ correct, xpAwarded, newXP, streak });
}
