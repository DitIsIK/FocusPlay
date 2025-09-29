import { NextResponse } from "next/server";
import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";
import { QuizAnswerSchema } from "@/types/challenge";

export async function POST(request: Request) {
  const body = await request.json();
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ correct: true, xpAwarded: 10, newXP: 130, streak: 4, echo: body });
  }
  const user = await requireUser();
  const parsed = QuizAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige input" }, { status: 400 });
  }
  const supabase = getSupabaseRouteHandler();
  const { data: challenge } = await supabase.from("challenges").select("*").eq("id", parsed.data.challengeId).single();
  if (!challenge || challenge.type !== "quiz") {
    return NextResponse.json({ error: "Quiz niet gevonden" }, { status: 404 });
  }
  const content = challenge.content as { answerIndex?: number };
  const correct = content.answerIndex === parsed.data.answerIndex;
  const xpAwarded = correct ? 10 : 0;
  const { data: profile } = await supabase.from("users").select("xp, streak_days").eq("id", user.id).single();
  const newXP = (profile?.xp ?? 0) + xpAwarded;
  await supabase.from("users").update({ xp: newXP, streak_days: (profile?.streak_days ?? 0) + (correct ? 1 : 0) }).eq("id", user.id);
  return NextResponse.json({ correct, xpAwarded, newXP, streak: (profile?.streak_days ?? 0) + (correct ? 1 : 0) });
}
