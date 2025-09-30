import { createDemoChallenges, DEMO_USER_ID } from "@/mock/seed";
import { Challenge } from "@/types/challenge";
import { DAILY_LIMITS, PremiumTier, Theme } from "@/lib/utils";
import { xpForAction } from "@/lib/xp";

const PAGE_SIZE = 10;

type PollState = {
  totals: number[];
  userChoice: number | null;
};

type DemoState = {
  challenges: Challenge[];
  xp: number;
  streak: number;
  lastStreakDate: string | null;
  cardsConsumedToday: number;
  lastCardReset: string | null;
  premium: PremiumTier;
  factViews: Set<string>;
  pollStates: Map<string, PollState>;
  quizCorrect: Set<string>;
  lastAction: string | null;
};

let state = createState();

function createState(): DemoState {
  const challenges = createDemoChallenges();
  const pollStates = new Map<string, PollState>();
  challenges.forEach((challenge) => {
    if (challenge.type === "poll") {
      const options = challenge.content.options ?? [];
      const totals = options.map(() => Math.floor(Math.random() * 3) + 1);
      pollStates.set(challenge.id, { totals, userChoice: null });
    }
  });
  return {
    challenges,
    xp: 120,
    streak: 3,
    lastStreakDate: null,
    cardsConsumedToday: 0,
    lastCardReset: null,
    premium: "free",
    factViews: new Set(),
    pollStates,
    quizCorrect: new Set(),
    lastAction: null
  };
}

function getTodayStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function ensureDailyReset() {
  const todayStart = getTodayStart();
  if (!state.lastCardReset || new Date(state.lastCardReset) < todayStart) {
    state.cardsConsumedToday = 0;
    state.lastCardReset = todayStart.toISOString();
  }
}

function ensurePollState(challenge: Challenge) {
  if (challenge.type !== "poll") return;
  const existing = state.pollStates.get(challenge.id);
  if (!existing) {
    const options = challenge.content.options ?? [];
    state.pollStates.set(challenge.id, {
      totals: options.map(() => 1),
      userChoice: null
    });
  }
}

function todayIsoString() {
  return getTodayStart().toISOString().slice(0, 10);
}

function awardDemoXp(amount: number) {
  if (amount <= 0) {
    return { xpDelta: 0, newXP: state.xp, streak: state.streak };
  }
  const todayIso = todayIsoString();
  if (!state.lastStreakDate) {
    state.streak = Math.max(state.streak, 0) + 1;
    state.lastStreakDate = todayIso;
  } else {
    const previous = new Date(`${state.lastStreakDate}T00:00:00Z`);
    const todayStart = getTodayStart();
    const diffDays = Math.floor((todayStart.getTime() - previous.getTime()) / 86_400_000);
    if (diffDays === 1) {
      state.streak += 1;
      state.lastStreakDate = todayIso;
    } else if (diffDays > 1) {
      state.streak = 1;
      state.lastStreakDate = todayIso;
    }
  }
  state.xp += amount;
  state.lastAction = new Date().toISOString();
  return { xpDelta: amount, newXP: state.xp, streak: state.streak };
}

function computePercentages(totals: number[]) {
  const total = totals.reduce((acc, value) => acc + value, 0);
  if (total === 0) {
    return totals.map(() => 0);
  }
  return totals.map((value) => Math.round((value / total) * 100));
}

export function resetDemoData() {
  state = createState();
}

function applyPremiumOverride(override: boolean | undefined) {
  if (override === undefined) return;
  if (override) {
    state.premium = "premium";
  } else if (!override && state.premium !== "pro") {
    state.premium = "free";
  }
}

export function getDemoFeed({
  cursor,
  premiumOverride
}: {
  cursor?: string | null;
  premiumOverride?: boolean;
}) {
  ensureDailyReset();
  applyPremiumOverride(premiumOverride);

  const dailyLimit = DAILY_LIMITS[state.premium];
  const remaining = Number.isFinite(dailyLimit)
    ? Math.max(dailyLimit - state.cardsConsumedToday, 0)
    : Infinity;

  if (remaining <= 0 && Number.isFinite(dailyLimit)) {
    return {
      items: [] as Challenge[],
      nextCursor: null as string | null,
      xp: state.xp,
      streak: state.streak,
      premium: state.premium,
      dailyRemaining: 0,
      teams: [] as { id: string; name: string; theme: string | null; invite_code: string | null }[],
      activeFilters: { theme: null as string | null, teamId: null as string | null },
      factViews: Array.from(state.factViews),
      demoMode: true
    };
  }

  const pageLimit = Number.isFinite(dailyLimit)
    ? Math.min(PAGE_SIZE, remaining)
    : PAGE_SIZE;

  let startIndex = 0;
  if (cursor) {
    const idx = state.challenges.findIndex((challenge) => challenge.id === cursor);
    startIndex = idx >= 0 ? idx + 1 : state.challenges.length;
  }

  const items = state.challenges.slice(startIndex, startIndex + pageLimit);
  const lastItem = items.at(-1);
  const nextExists = state.challenges[startIndex + items.length];
  if (items.length && Number.isFinite(dailyLimit)) {
    state.cardsConsumedToday += items.length;
  }
  const dailyRemaining = Number.isFinite(dailyLimit)
    ? Math.max(dailyLimit - state.cardsConsumedToday, 0)
    : null;

  return {
    items,
    nextCursor: nextExists && lastItem ? lastItem.id : null,
    xp: state.xp,
    streak: state.streak,
    premium: state.premium,
    dailyRemaining,
    teams: [] as { id: string; name: string; theme: string | null; invite_code: string | null }[],
    activeFilters: { theme: null as string | null, teamId: null as string | null },
    factViews: Array.from(state.factViews),
    demoMode: true
  };
}

export function answerDemoQuiz(challengeId: string, answerIndex: number) {
  const challenge = state.challenges.find((item) => item.id === challengeId);
  if (!challenge || challenge.type !== "quiz") {
    return { error: "Quiz niet gevonden" } as const;
  }
  if (
    challenge.content.answerIndex === undefined ||
    !challenge.content.options ||
    answerIndex < 0 ||
    answerIndex >= challenge.content.options.length
  ) {
    return { error: "Antwoord niet geldig" } as const;
  }
  const correct = challenge.content.answerIndex === answerIndex;
  let xpDelta = 0;
  let newXP = state.xp;
  let streak = state.streak;
  if (correct && !state.quizCorrect.has(challengeId)) {
    const award = awardDemoXp(xpForAction("quiz", true));
    xpDelta = award.xpDelta;
    newXP = award.newXP;
    streak = award.streak;
    state.quizCorrect.add(challengeId);
  }
  return { correct, xpAwarded: xpDelta, newXP, streak };
}

export function voteDemoPoll(challengeId: string, choice: number) {
  const challenge = state.challenges.find((item) => item.id === challengeId);
  if (!challenge || challenge.type !== "poll") {
    return { error: "Poll niet gevonden" } as const;
  }
  ensurePollState(challenge);
  const options = challenge.content.options ?? [];
  const poll = state.pollStates.get(challengeId)!;
  if (choice < 0 || choice >= options.length) {
    return { error: "Ongeldige keuze" } as const;
  }
  const alreadyVoted = poll.userChoice !== null;
  if (alreadyVoted && poll.userChoice !== null) {
    poll.totals[poll.userChoice] = Math.max(poll.totals[poll.userChoice] - 1, 0);
  }
  poll.userChoice = choice;
  poll.totals[choice] = (poll.totals[choice] ?? 0) + 1;
  state.pollStates.set(challengeId, poll);
  const award = awardDemoXp(alreadyVoted ? 0 : xpForAction("poll"));
  return {
    percentages: computePercentages(poll.totals),
    xpAwarded: award.xpDelta,
    newXP: award.newXP
  };
}

export function getDemoPollPercentages(challengeId: string) {
  const challenge = state.challenges.find((item) => item.id === challengeId);
  if (!challenge || challenge.type !== "poll") {
    return { percentages: [] as number[] };
  }
  ensurePollState(challenge);
  const poll = state.pollStates.get(challengeId)!;
  return { percentages: computePercentages(poll.totals) };
}

export function markDemoFact(challengeId: string) {
  const challenge = state.challenges.find((item) => item.id === challengeId);
  if (!challenge || challenge.type !== "fact") {
    return { error: "Fact niet gevonden" } as const;
  }
  const already = state.factViews.has(challengeId);
  if (!already) {
    state.factViews.add(challengeId);
  }
  const award = awardDemoXp(already ? 0 : xpForAction("fact"));
  return { xpDelta: award.xpDelta, newXP: award.newXP, alreadyCounted: already, streak: state.streak };
}

export function getDemoProfile() {
  ensureDailyReset();
  const dailyLimit = DAILY_LIMITS[state.premium];
  const dailyRemaining = Number.isFinite(dailyLimit)
    ? Math.max(dailyLimit - state.cardsConsumedToday, 0)
    : null;
  return {
    id: DEMO_USER_ID,
    email: "demo@focusplay.app",
    display_name: "Demo speler",
    premium_tier: state.premium,
    xp: state.xp,
    streak_days: state.streak,
    dailyRemaining,
    fact_read: state.factViews.size > 0,
    demoMode: true,
    cards_consumed_today: state.cardsConsumedToday,
    last_card_reset: state.lastCardReset,
    last_streak_date: state.lastStreakDate,
    last_action: state.lastAction,
    teams: [] as { id: string; name: string; role: string; invite_code: string | null; theme: string }[],
    avatar_url: null as string | null
  };
}

export function getDemoLeaderboard() {
  const me = {
    id: DEMO_USER_ID,
    display_name: "Demo speler",
    xp: state.xp,
    streak_days: state.streak,
    avatar_url: null
  };
  const global = [
    { id: "00000000-0000-0000-0000-000000010000", display_name: "Focus legend", xp: 320, streak_days: 9, avatar_url: null },
    { id: "00000000-0000-0000-0000-000000010001", display_name: "Deep work dino", xp: 250, streak_days: 7, avatar_url: null },
    { id: "00000000-0000-0000-0000-000000010002", display_name: "Cardio kid", xp: 180, streak_days: 4, avatar_url: null },
    me
  ].sort((a, b) => b.xp - a.xp);
  const friends = [
    me,
    { id: "00000000-0000-0000-0000-000000020000", display_name: "buddy", xp: 95, streak_days: 2, avatar_url: null },
    { id: "00000000-0000-0000-0000-000000020001", display_name: "sparring", xp: 150, streak_days: 5, avatar_url: null }
  ].sort((a, b) => b.xp - a.xp);
  return { global, friends, demoMode: true };
}

export function getRandomDemoChallenge(type: "quiz" | "fact" = "quiz", theme?: Theme) {
  const pool = state.challenges.filter((challenge) => {
    if (challenge.type !== type) return false;
    if (theme && challenge.theme !== theme) return false;
    return true;
  });
  const selection = pool.length ? pool[Math.floor(Math.random() * pool.length)] : state.challenges[0];
  return {
    ...selection,
    content: { ...selection.content }
  };
}
