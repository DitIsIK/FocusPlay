"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { Challenge, ChallengeSchema } from "@/types/challenge";
import { THEMES } from "@/lib/utils";
import { QuizCard } from "@/components/quiz-card";
import { PollCard } from "@/components/poll-card";
import { FactCard } from "@/components/fact-card";
import { XPBar } from "@/components/xp-bar";
import { UpgradeDialog } from "@/components/upgrade-dialog";

interface TeamSummary {
  id: string;
  name: string;
  theme: string | null;
  invite_code: string | null;
}

interface FeedResponse {
  items: Challenge[];
  nextCursor: string | null;
  xp: number;
  streak: number;
  premium: "free" | "premium" | "pro";
  dailyRemaining: number | null;
  teams: TeamSummary[];
  activeFilters: {
    theme: string | null;
    teamId: string | null;
  };
  factViews: string[];
  demoMode?: boolean;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    let message = "Kon feed niet laden";
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch (error) {
      // ignore
    }
    throw new Error(message);
  }
  const data = (await res.json()) as FeedResponse;
  return {
    ...data,
    items: data.items.map((item) => ChallengeSchema.parse(item))
  };
};

export function FeedList({ initialData }: { initialData: FeedResponse }) {
  const [xp, setXp] = useState(initialData.xp);
  const [streak] = useState(initialData.streak);
  const [themeFilter, setThemeFilter] = useState<string | "">(initialData.activeFilters.theme ?? "");
  const [teamFilter, setTeamFilter] = useState<string | "">(initialData.activeFilters.teamId ?? "");
  const [readFacts, setReadFacts] = useState<Set<string>>(() => new Set(initialData.factViews ?? []));

  const fallbackData = !themeFilter && !teamFilter ? [initialData] : undefined;

  const { data, setSize, isValidating, error } = useSWRInfinite<FeedResponse>(
    (index, prev) => {
      const params = new URLSearchParams();
      if (themeFilter) {
        params.set("theme", themeFilter);
      }
      if (teamFilter) {
        params.set("teamId", teamFilter);
      }
      if (index === 0) {
        const query = params.toString();
        return query ? `/api/feed?${query}` : `/api/feed`;
      }
      if (!prev?.nextCursor) return null;
      params.set("cursor", prev.nextCursor);
      return `/api/feed?${params.toString()}`;
    },
    fetcher,
    {
      revalidateFirstPage: true,
      fallbackData
    }
  );

  const items = data?.flatMap((page) => page.items) ?? [];
  const nextCursor = data?.[data.length - 1]?.nextCursor;
  const premium = data?.[0]?.premium ?? initialData.premium;
  const dailyRemaining = data?.[0]?.dailyRemaining ?? initialData.dailyRemaining;
  const teams = data?.[0]?.teams ?? initialData.teams;
  const demoMode = data?.[0]?.demoMode ?? initialData.demoMode ?? false;

  useEffect(() => {
    setReadFacts((prev) => {
      const next = new Set(prev);
      const seeds = [
        ...(initialData.factViews ?? []),
        ...((data ?? []).flatMap((page) => page.factViews ?? []))
      ];
      let changed = false;
      for (const id of seeds) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [data, initialData.factViews]);

  useEffect(() => {
    setSize(1);
  }, [themeFilter, teamFilter, setSize]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && nextCursor) {
        setSize((size) => size + 1);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [nextCursor, setSize]);

  const handleQuizAnswer = useCallback(
    async ({ challengeId, answerIndex }: { challengeId: string; answerIndex: number }) => {
      const res = await fetch(`/api/answer-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, answerIndex })
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.newXP === "number") {
          setXp(data.newXP);
        }
        return { correct: Boolean(data.correct), xpAwarded: Number(data.xpAwarded ?? 0) };
      }
      return { correct: false, xpAwarded: 0 };
    },
    []
  );

  const handlePollVote = useCallback(async (choice: number, id: string) => {
    const res = await fetch(`/api/poll/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: id, choice })
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof data.newXP === "number") {
        setXp(data.newXP);
      }
      return {
        percentages: Array.isArray(data.percentages) ? (data.percentages as number[]) : undefined,
        xpAwarded: typeof data.xpAwarded === "number" ? data.xpAwarded : undefined
      };
    }
    return undefined;
  }, []);

  const handleFactView = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/fact-view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: id })
      });
      if (!res.ok) {
        try {
          const body = (await res.json()) as { error?: string };
          return { error: body.error ?? "Kon fact niet bijwerken" };
        } catch (error) {
          return { error: "Kon fact niet bijwerken" };
        }
      }
      const data = (await res.json()) as {
        xpDelta?: number;
        newXP?: number;
        alreadyCounted?: boolean;
      };
      if (typeof data.newXP === "number") {
        setXp(data.newXP);
      }
      setReadFacts((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      return {
        alreadyCounted: Boolean(data.alreadyCounted),
        xpDelta: typeof data.xpDelta === "number" ? data.xpDelta : 0
      };
    },
    []
  );

  if (error) {
    return <p className="text-white/60">{error.message}</p>;
  }

  if (!items.length) {
    return <p className="text-white/40">Geen kaarten meer. Morgen weer prikkels.</p>;
  }

  return (
    <div className="space-y-6">
      <XPBar xp={xp} />
      {demoMode && (
        <p className="rounded-3xl border border-white/5 bg-white/5 p-4 text-xs text-white/60">
          Demo modus actief. Data wordt lokaal bewaard en kan op elk moment resetten.
        </p>
      )}
      {!demoMode && premium === "free" && <UpgradeDialog />}
      <p className="text-xs text-white/50">Dagelijkse streak: {streak} dagen</p>
      <p className="text-xs text-white/40">Resterend vandaag: {dailyRemaining === null ? "∞" : dailyRemaining}</p>
      {premium === "pro" && (
        <div className="flex flex-col gap-3 rounded-3xl border border-white/5 bg-white/5 p-4 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap gap-2">
            <label className="flex items-center gap-2">
              Thema
              <select
                value={themeFilter}
                onChange={(event) => setThemeFilter(event.target.value)}
                className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white"
              >
                <option value="">Alles</option>
                {THEMES.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              Team
              <select
                value={teamFilter}
                onChange={(event) => setTeamFilter(event.target.value)}
                className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white"
              >
                <option value="">Public feed</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 transition hover:border-white/30"
            onClick={() => {
              setThemeFilter(initialData.activeFilters.theme ?? "");
              setTeamFilter(initialData.activeFilters.teamId ?? "");
            }}
            type="button"
          >
            Reset filters
          </button>
        </div>
      )}
      <div className="space-y-6">
        {items.map((challenge) => {
          if (challenge.type === "quiz") {
            return <QuizCard key={challenge.id} challenge={challenge} onAnswer={handleQuizAnswer} />;
          }
          if (challenge.type === "poll") {
            return (
              <PollCard
                key={challenge.id}
                challenge={challenge}
                onVote={(choice) => handlePollVote(choice, challenge.id)}
              />
            );
          }
          return (
            <FactCard
              key={challenge.id}
              challenge={challenge}
              alreadyRead={readFacts.has(challenge.id)}
              onMarkRead={() => handleFactView(challenge.id)}
            />
          );
        })}
      </div>
      <div ref={sentinelRef} className="h-20" />
      {isValidating && <p className="text-xs text-white/40">Laden…</p>}
    </div>
  );
}
