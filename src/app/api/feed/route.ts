import { NextResponse } from "next/server";
import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";
import { DAILY_LIMITS } from "@/lib/utils";

function getUtcStartOfDay(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return start;
}

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    const { MOCK_CHALLENGES } = await import("@/lib/mock");
    return NextResponse.json({
      items: MOCK_CHALLENGES,
      nextCursor: null,
      xp: 120,
      streak: 3,
      premium: "free",
      dailyRemaining: 10
    });
  }
  const user = await requireUser();
  const supabase = getSupabaseRouteHandler();
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");

  const profileQuery = supabase.from("users").select("*").eq("id", user.id).single();

  const now = new Date();

  const [{ data: profile }] = await Promise.all([profileQuery]);

  if (!profile) {
    return NextResponse.json({ error: "Profiel mist" }, { status: 404 });
  }

  const dailyLimit = DAILY_LIMITS[profile.premium_tier] ?? 10;
  const startOfToday = getUtcStartOfDay(now);
  const lastReset = profile.last_card_reset ? new Date(profile.last_card_reset) : null;
  const resetNeeded = !lastReset || lastReset < startOfToday;
  const consumedToday = resetNeeded ? 0 : profile.cards_consumed_today ?? 0;
  const remaining = dailyLimit === Infinity ? Infinity : Math.max(dailyLimit - consumedToday, 0);

  if (remaining === 0) {
    if (dailyLimit !== Infinity) {
      await supabase
        .from("users")
        .update({ cards_consumed_today: consumedToday, last_card_reset: now.toISOString() })
        .eq("id", user.id);
    }
    return NextResponse.json({
      items: [],
      nextCursor: null,
      xp: profile.xp,
      streak: profile.streak_days,
      premium: profile.premium_tier,
      dailyRemaining: 0
    });
  }

  const pageLimit = dailyLimit === Infinity ? PAGE_SIZE : Math.min(PAGE_SIZE, remaining);

  const challengeQuery = supabase
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(pageLimit + 1);

  if (cursor) {
    challengeQuery.lt("created_at", cursor);
  }

  const { data: challenges } = await challengeQuery;

  const items = (challenges ?? [])
    .slice(0, pageLimit)
    .map((challenge) => ({
      ...challenge,
      content: (challenge.content ?? {}) as Record<string, unknown>
    }));
  const nextCursor = challenges && challenges.length > pageLimit ? challenges[pageLimit].created_at : null;

  const servedCount = items.length;

  if (dailyLimit !== Infinity && servedCount > 0) {
    const updatedCount = consumedToday + servedCount;
    await supabase
      .from("users")
      .update({
        cards_consumed_today: updatedCount,
        last_card_reset: resetNeeded ? now.toISOString() : profile.last_card_reset ?? now.toISOString()
      })
      .eq("id", user.id);
  }

  const dailyRemaining = dailyLimit === Infinity ? null : Math.max(dailyLimit - (consumedToday + servedCount), 0);

  return NextResponse.json({
    items,
    nextCursor,
    xp: profile.xp,
    streak: profile.streak_days,
    premium: profile.premium_tier,
    dailyRemaining
  });
}
