import { NextResponse } from "next/server";
import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";
import { generateChallenge } from "@/lib/ai";
import { THEMES, GENERATE_LIMITS } from "@/lib/utils";
import { takeToken } from "@/lib/rate-limit";

export const runtime = "edge";

export async function POST(request: Request) {
  if (
    !process.env.OPENAI_API_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const { MOCK_CHALLENGES } = await import("@/lib/mock");
    return NextResponse.json(MOCK_CHALLENGES[0]);
  }
  const user = await requireUser();
  const body = await request.json();
  const type = body.type === "fact" ? "fact" : "quiz";
  const theme = THEMES.includes(body.theme) ? body.theme : "general";

  const supabase = getSupabaseRouteHandler();
  const { data: profile } = await supabase.from("users").select("premium_tier").eq("id", user.id).single();
  const tier = profile?.premium_tier ?? "free";
  const limit = GENERATE_LIMITS[tier];
  const key = `${user.id}:generate`;
  const bucket = takeToken({ key, limit: Number.isFinite(limit) ? limit : Number.MAX_SAFE_INTEGER });
  if (bucket.blocked) {
    return NextResponse.json({ error: "Rustig aan, legende." }, { status: 429 });
  }

  try {
    const challenge = await generateChallenge({ type, theme });
    return NextResponse.json(challenge);
  } catch (error) {
    return NextResponse.json({ error: "Kon geen challenge genereren" }, { status: 500 });
  }
}
