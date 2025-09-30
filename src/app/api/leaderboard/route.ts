import { NextResponse } from "next/server";
import { getSupabaseRouteHandler, requireUser } from "@/lib/auth";
import { isDemoMode, hasSupabaseConfig } from "@/lib/env";
import { getDemoLeaderboard } from "@/lib/mock";

export async function GET() {
  if (isDemoMode() || !hasSupabaseConfig()) {
    return NextResponse.json(getDemoLeaderboard());
  }
  const user = await requireUser();
  const supabase = getSupabaseRouteHandler();
  const [{ data: global }, { data: friends }, { data: accepted }] = await Promise.all([
    supabase
      .from("public_profiles")
      .select("id, display_name, xp, streak_days, avatar_url")
      .order("xp", { ascending: false })
      .limit(20),
    supabase
      .from("friends")
      .select("user_b")
      .eq("user_a", user.id)
      .eq("status", "accepted"),
    supabase
      .from("friends")
      .select("user_a")
      .eq("user_b", user.id)
      .eq("status", "accepted")
  ]);

  const friendIds = new Set<string>();
  friends?.forEach((f) => friendIds.add(f.user_b));
  accepted?.forEach((f) => friendIds.add(f.user_a));

  const { data: friendProfiles } = await supabase
    .from("public_profiles")
    .select("id, display_name, xp, streak_days, avatar_url")
    .in("id", friendIds.size ? Array.from(friendIds) : [user.id]);

  return NextResponse.json({
    global: global ?? [],
    friends: friendProfiles ?? []
  });
}
