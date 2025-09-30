import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";
import { awardXp } from "@/lib/xp";
import { isDemoMode, hasSupabaseConfig } from "@/lib/env";
import { markDemoFact } from "@/lib/mock";

const FactViewSchema = z.object({
  challengeId: z.string().uuid()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = FactViewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Onvolledige aanvraag" }, { status: 400 });
  }

  if (isDemoMode() || !hasSupabaseConfig()) {
    const result = markDemoFact(parsed.data.challengeId);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json(result);
  }

  const user = await requireUser();
  const supabase = getSupabaseRouteHandler();

  const { data: challenge } = await supabase
    .from("challenges")
    .select("type")
    .eq("id", parsed.data.challengeId)
    .single();

  if (!challenge || challenge.type !== "fact") {
    return NextResponse.json({ error: "Fact niet gevonden" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("fact_views")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("challenge_id", parsed.data.challengeId)
    .maybeSingle();

  if (existing) {
    const { newXP, xpDelta } = await awardXp({ supabase, userId: user.id, amount: 0 });
    return NextResponse.json({ xpDelta, newXP, alreadyCounted: true });
  }

  const { error: insertError } = await supabase
    .from("fact_views")
    .insert({ user_id: user.id, challenge_id: parsed.data.challengeId });

  if (insertError && insertError.code !== "23505") {
    return NextResponse.json({ error: "Fact kon niet worden geregistreerd" }, { status: 500 });
  }

  const amount = insertError && insertError.code === "23505" ? 0 : 3;
  const { newXP, xpDelta } = await awardXp({ supabase, userId: user.id, amount });

  return NextResponse.json({ xpDelta, newXP, alreadyCounted: amount === 0 });
}
