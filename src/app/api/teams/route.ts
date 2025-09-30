import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseRouteHandler, requireUser } from "@/lib/auth";
import { THEMES } from "@/lib/utils";

const CreateTeamSchema = z.object({
  name: z.string().min(3).max(40),
  theme: z.enum(THEMES),
  isPrivate: z.boolean().optional()
});

export async function GET() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ teams: [] });
  }
  const user = await requireUser();
  const supabase = getSupabaseRouteHandler();
  const { data } = await supabase
    .from("team_members")
    .select("team_id, role, team_rooms(id, name, theme, invite_code, is_private)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  const teams = (data ?? []).map((row) => ({
    id: row.team_id,
    role: row.role,
    name: row.team_rooms?.name ?? "",
    theme: row.team_rooms?.theme ?? "general",
    invite_code: row.team_rooms?.invite_code ?? null,
    is_private: row.team_rooms?.is_private ?? false
  }));
  return NextResponse.json({ teams });
}

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
  const parsed = CreateTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldig team" }, { status: 400 });
  }
  const supabase = getSupabaseRouteHandler();
  const { data: profile } = await supabase.from("users").select("premium_tier").eq("id", user.id).single();
  if (profile?.premium_tier !== "pro") {
    return NextResponse.json({ error: "Team rooms zijn pro-only" }, { status: 403 });
  }
  const inviteCode = randomUUID().split("-")[0];
  const { data: team, error } = await supabase
    .from("team_rooms")
    .insert({
      name: parsed.data.name,
      theme: parsed.data.theme,
      owner: user.id,
      invite_code: inviteCode,
      is_private: parsed.data.isPrivate ?? false
    })
    .select("id, name, theme, invite_code, is_private")
    .single();
  if (error || !team) {
    return NextResponse.json({ error: "Kon team niet aanmaken" }, { status: 500 });
  }
  await supabase.from("team_members").insert({ team_id: team.id, user_id: user.id, role: "owner" });
  return NextResponse.json({ team });
}
