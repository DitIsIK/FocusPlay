import { NextResponse } from "next/server";
import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    const { MOCK_PROFILE } = await import("@/lib/mock");
    return NextResponse.json({ ...MOCK_PROFILE, avatar_url: null, last_action: null });
  }
  const user = await requireUser();
  const supabase = getSupabaseRouteHandler();
  const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single();
  if (error || !data) {
    return NextResponse.json({ error: "Profiel niet gevonden" }, { status: 404 });
  }
  return NextResponse.json(data);
}
