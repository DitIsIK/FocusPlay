import { NextResponse } from "next/server";
import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";
import { DAILY_LIMITS, THEMES } from "@/lib/utils";
import { isDemoMode, hasSupabaseConfig } from "@/lib/env";
import { getDemoFeed } from "@/lib/mock";

function getUtcStartOfDay(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return start;
}

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (isDemoMode() || !hasSupabaseConfig()) {
    const cursor = searchParams.get("cursor");
    const premiumParam = searchParams.get("premium");
    const premiumOverride = premiumParam === null ? undefined : premiumParam === "1";
    const demo = getDemoFeed({ cursor, premiumOverride });
    return NextResponse.json(demo);
  }
  const user = await requireUser();
  const supabase = getSupabaseRouteHandler();
  const cursor = searchParams.get("cursor");
  const requestedTheme = searchParams.get("theme");
  const requestedTeam = searchParams.get("teamId");

  const profileQuery = supabase.from("users").select("*").eq("id", user.id).single();

  const now = new Date();

  const [{ data: profile }] = await Promise.all([profileQuery]);

  if (!profile) {
    return NextResponse.json({ error: "Profiel mist" }, { status: 404 });
  }

  const isPro = profile.premium_tier === "pro";

  const activeTheme = requestedTheme && isPro && THEMES.includes(requestedTheme as (typeof THEMES)[number])
    ? requestedTheme
    : null;

  let activeTeamId: string | null = null;
  if (requestedTeam && isPro) {
    const { data: membership } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("team_id", requestedTeam)
      .eq("user_id", user.id)
      .maybeSingle();
    activeTeamId = membership?.team_id ?? null;
    if (!activeTeamId) {
      return NextResponse.json({ error: "Geen toegang tot team" }, { status: 403 });
    }
  }

  const teams = isPro
    ? (
        (
          await supabase
            .from("team_members")
            .select("team_id, team_rooms(id, name, theme, invite_code)")
            .eq("user_id", user.id)
        ).data ?? []
      ).map((row) => ({
        id: row.team_id,
        name: row.team_rooms?.name ?? "",
        theme: row.team_rooms?.theme ?? null,
        invite_code: row.team_rooms?.invite_code ?? null
      }))
    : [];

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
      dailyRemaining: 0,
      teams,
      activeFilters: {
        theme: activeTheme,
        teamId: activeTeamId
      },
      factViews: []
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

  if (activeTheme) {
    challengeQuery.eq("theme", activeTheme);
  }

  if (activeTeamId) {
    challengeQuery.eq("team_id", activeTeamId);
  } else {
    challengeQuery.is("team_id", null);
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

  let factViews: string[] = [];
  const factIds = items.filter((item) => item.type === "fact").map((item) => item.id);
  if (factIds.length) {
    const { data: views } = await supabase
      .from("fact_views")
      .select("challenge_id")
      .eq("user_id", user.id)
      .in("challenge_id", factIds);
    factViews = (views ?? []).map((view) => view.challenge_id);
  }

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
    dailyRemaining,
    teams,
    activeFilters: {
      theme: activeTheme,
      teamId: activeTeamId
    },
    factViews
  });
}
