import { NextResponse } from "next/server";
import { getSupabaseRouteHandler, requireUser } from "@/lib/auth";
import { CreateChallengeSchema } from "@/types/challenge";

export async function POST(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ success: true });
  }
  const user = await requireUser();
  const supabase = getSupabaseRouteHandler();
  const formData = await request.formData();
  const type = String(formData.get("type"));
  const theme = String(formData.get("theme"));
  const payload = formData.get("payload");
  const teamIdValue = formData.get("teamId");
  let jsonPayload: Record<string, unknown> = {};
  try {
    jsonPayload = payload ? JSON.parse(String(payload)) : {};
  } catch (error) {
    return NextResponse.json({ error: "Payload geen geldige JSON" }, { status: 400 });
  }
  const parsed = CreateChallengeSchema.safeParse({
    type,
    theme,
    teamId: teamIdValue ? String(teamIdValue) : undefined,
    ...jsonPayload
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldig challenge-formaat" }, { status: 400 });
  }
  if (parsed.data.teamId) {
    const { data: membership } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("team_id", parsed.data.teamId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!membership) {
      return NextResponse.json({ error: "Geen toegang tot dit team" }, { status: 403 });
    }
  }
  const { data, error } = await supabase.from("challenges").insert({
    type: parsed.data.type,
    theme: parsed.data.theme,
    content: {
      question: parsed.data.question,
      options: parsed.data.options,
      answerIndex: parsed.data.answerIndex,
      fact: parsed.data.fact
    },
    author: user.id,
    visibility: parsed.data.teamId ? "friends" : "global",
    team_id: parsed.data.teamId ?? null
  });
  if (error) {
    return NextResponse.json({ error: "Kon challenge niet bewaren" }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}
