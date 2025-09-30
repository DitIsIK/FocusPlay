import { NextResponse } from "next/server";
import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";
import { DAILY_LIMITS } from "@/lib/utils";
import { isDemoMode, hasSupabaseConfig } from "@/lib/env";
import { getDemoProfile } from "@/lib/mock";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isDemoMode() || !hasSupabaseConfig()) {
    const profile = getDemoProfile();
    return NextResponse.json(profile);
  }
  const user = await requireUser();
  const supabase = getSupabaseRouteHandler();
  const [{ data, error }, { data: teamsData }, { data: factView }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase
      .from("team_members")
      .select("team_id, role, team_rooms(id, name, theme, invite_code, is_private)")
      .eq("user_id", user.id),
    supabase
      .from("fact_views")
      .select("challenge_id")
      .eq("user_id", user.id)
      .limit(1)
  ]);
  if (error || !data) {
    return NextResponse.json({ error: "Profiel niet gevonden" }, { status: 404 });
  }
  const teams = (teamsData ?? []).map((row) => ({
    id: row.team_id,
    role: row.role,
    name: row.team_rooms?.name ?? "",
    theme: row.team_rooms?.theme ?? "general",
    invite_code: row.team_rooms?.invite_code ?? null,
    is_private: row.team_rooms?.is_private ?? false
  }));
  const dailyLimit = DAILY_LIMITS[data.premium_tier as keyof typeof DAILY_LIMITS] ?? 10;
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const lastReset = data.last_card_reset ? new Date(data.last_card_reset) : null;
  const resetNeeded = !lastReset || lastReset < startOfToday;
  const consumedToday = resetNeeded ? 0 : data.cards_consumed_today ?? 0;
  const dailyRemaining = dailyLimit === Infinity ? null : Math.max(dailyLimit - consumedToday, 0);
  return NextResponse.json({
    ...data,
    teams,
    dailyRemaining,
    fact_read: Boolean(factView && factView.length > 0)
  });
}
