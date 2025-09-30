import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseRouteHandler, requireUser } from "@/lib/auth";

const JoinSchema = z.object({
  code: z.string().min(4)
});

const MAX_MEMBERS = 20;

export async function POST(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ error: "Supabase niet geconfigureerd" }, { status: 400 });
  }
  const user = await requireUser();
  const body = await request.json();
  const parsed = JoinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invite code ongeldig" }, { status: 400 });
  }
  const supabase = getSupabaseRouteHandler();
  const { data: profile } = await supabase.from("users").select("premium_tier").eq("id", user.id).single();
  if (profile?.premium_tier !== "pro") {
    return NextResponse.json({ error: "Pro vereist" }, { status: 403 });
  }
  const { data: team } = await supabase
    .from("team_rooms")
    .select("id, name")
    .eq("invite_code", parsed.data.code)
    .single();
  if (!team) {
    return NextResponse.json({ error: "Team niet gevonden" }, { status: 404 });
  }
  const { count } = await supabase
    .from("team_members")
    .select("user_id", { count: "exact", head: true })
    .eq("team_id", team.id);
  if ((count ?? 0) >= MAX_MEMBERS) {
    return NextResponse.json({ error: "Team zit vol" }, { status: 403 });
  }
  const { data: existing } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("team_id", team.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ message: "Al lid" });
  }
  await supabase.from("team_members").insert({ team_id: team.id, user_id: user.id, role: "member" });
  return NextResponse.json({ joined: true });
}
