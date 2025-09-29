import { NextResponse } from "next/server";
import { getSupabaseRouteHandler, requireUser } from "@/lib/auth";

export async function GET() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    const { MOCK_PROFILE } = await import("@/lib/mock");
    return NextResponse.json({
      global: [
        { ...MOCK_PROFILE, avatar_url: null },
        { ...MOCK_PROFILE, id: "00000000-0000-0000-0000-000000000111", display_name: "buddy", xp: 90, streak_days: 2, avatar_url: null }
      ],
      friends: [
        { ...MOCK_PROFILE, avatar_url: null },
        { ...MOCK_PROFILE, id: "00000000-0000-0000-0000-000000000222", display_name: "sparring", xp: 150, streak_days: 5, avatar_url: null }
      ]
    });
  }
  const user = await requireUser();
  const supabase = getSupabaseRouteHandler();
  const [{ data: global }, { data: friends }, { data: accepted }] = await Promise.all([
    supabase.from("users").select("id, display_name, xp, streak_days, avatar_url").order("xp", { ascending: false }).limit(20),
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
    .from("users")
    .select("id, display_name, xp, streak_days, avatar_url")
    .in("id", friendIds.size ? Array.from(friendIds) : [user.id]);

  return NextResponse.json({
    global: global ?? [],
    friends: friendProfiles ?? []
  });
}
