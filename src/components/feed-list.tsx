"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { Challenge, ChallengeSchema } from "@/types/challenge";
import { QuizCard } from "@/components/quiz-card";
import { PollCard } from "@/components/poll-card";
import { FactCard } from "@/components/fact-card";
import { XPBar } from "@/components/xp-bar";
import { UpgradeDialog } from "@/components/upgrade-dialog";

interface FeedResponse {
  items: Challenge[];
  nextCursor: string | null;
  xp: number;
  streak: number;
  premium: "free" | "premium" | "pro";
  dailyRemaining: number | null;
}

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data: FeedResponse) => ({
      ...data,
      items: data.items.map((item) => ChallengeSchema.parse(item))
    }));

export function FeedList({ initialData }: { initialData: FeedResponse }) {
  const [xp, setXp] = useState(initialData.xp);
  const [streak] = useState(initialData.streak);
  const { data, setSize, isValidating } = useSWRInfinite<FeedResponse>(
    (index, prev) => {
      if (index === 0) return `/api/feed`;
      if (!prev?.nextCursor) return null;
      return `/api/feed?cursor=${prev.nextCursor}`;
    },
    fetcher,
    {
      revalidateFirstPage: false,
      fallbackData: [initialData]
    }
  );

  const items = data?.flatMap((page) => page.items) ?? [];
  const nextCursor = data?.[data.length - 1]?.nextCursor;
  const premium = data?.[0]?.premium ?? initialData.premium;
  const dailyRemaining = data?.[0]?.dailyRemaining ?? initialData.dailyRemaining;

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
      if (typeof data.xpAwarded === "number") {
        setXp((prev) => prev + data.xpAwarded);
      }
      return data.percentages as number[];
    }
    return undefined;
  }, []);

  if (!items.length) {
    return <p className="text-white/40">Geen kaarten meer. Morgen weer prikkels.</p>;
  }

  return (
    <div className="space-y-6">
      <XPBar xp={xp} />
      {premium === "free" && <UpgradeDialog />}
      <p className="text-xs text-white/50">Dagelijkse streak: {streak} dagen</p>
      <p className="text-xs text-white/40">Resterend vandaag: {dailyRemaining === null ? "∞" : dailyRemaining}</p>
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
          return <FactCard key={challenge.id} challenge={challenge} />;
        })}
      </div>
      <div ref={sentinelRef} className="h-20" />
      {isValidating && <p className="text-xs text-white/40">Laden…</p>}
    </div>
  );
}
