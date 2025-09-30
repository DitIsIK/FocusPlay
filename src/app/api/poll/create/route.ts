import { NextResponse } from "next/server";
import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";
import { CreateChallengeSchema } from "@/types/challenge";

export async function POST(request: Request) {
  const body = await request.json();
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ success: true });
  }
  const user = await requireUser();
  const parsed = CreateChallengeSchema.safeParse(body);
  if (!parsed.success || parsed.data.type !== "poll") {
    return NextResponse.json({ error: "Ongeldige poll" }, { status: 400 });
  }
  const supabase = getSupabaseRouteHandler();
  const { data: profile } = await supabase.from("users").select("premium_tier").eq("id", user.id).single();
  if ((profile?.premium_tier ?? "free") === "free") {
    return NextResponse.json({ error: "Upgrade nodig" }, { status: 403 });
  }
  const { error } = await supabase.from("challenges").insert({
    type: "poll",
    theme: parsed.data.theme,
    content: {
      question: parsed.data.question,
      options: parsed.data.options
    },
    author: user.id,
    visibility: "global"
  });
  if (error) {
    return NextResponse.json({ error: "Kon poll niet maken" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
