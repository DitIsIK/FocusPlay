"use client";

import { useCallback, useEffect, useState } from "react";
import { Challenge } from "@/types/challenge";
import { ChallengeCard } from "@/components/challenge-card";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

interface PollVoteResult {
  percentages?: number[];
  xpAwarded?: number;
}

export function PollCard({ challenge, onVote }: { challenge: Challenge; onVote?: (choice: number) => Promise<PollVoteResult | void> | void }) {
  const [percentages, setPercentages] = useState<number[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [xpMessage, setXpMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
    setPercentages(null);
    setXpMessage(null);
  }, [challenge.id]);

  const fetchPercentages = useCallback(async () => {
    try {
      const res = await fetch(`/api/poll/results?challengeId=${challenge.id}`);
      if (!res.ok) return;
      const data = (await res.json()) as { percentages?: number[] };
      if (Array.isArray(data.percentages)) {
        setPercentages(data.percentages);
      }
    } catch (error) {
      console.error("poll-percentage-fetch-failed", error);
    }
  }, [challenge.id]);

  useEffect(() => {
    fetchPercentages();
  }, [fetchPercentages]);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const channel = client
      .channel(`poll-${challenge.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "poll_votes", filter: `challenge_id=eq.${challenge.id}` },
        () => {
          fetchPercentages();
        }
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [challenge.id, fetchPercentages]);

  const vote = async (choice: number) => {
    setSelected(choice);
    setXpMessage(null);
    const response = await onVote?.(choice);
    if (response && typeof response === "object") {
      if (Array.isArray(response.percentages)) {
        setPercentages(response.percentages);
      } else {
        await fetchPercentages();
      }
      if (typeof response.xpAwarded === "number") {
        setXpMessage(response.xpAwarded > 0 ? `+${response.xpAwarded} XP` : "Al geteld.");
      }
    } else {
      await fetchPercentages();
    }
  };

  if (!challenge.content.options || !challenge.content.question) {
    return null;
  }

  return (
    <ChallengeCard challenge={challenge}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">{challenge.content.question}</h3>
        <div className="grid gap-3">
          {challenge.content.options.map((option, idx) => (
            <Button
              key={idx}
              variant="outline"
              onClick={() => vote(idx)}
              className={selected === idx ? "justify-between border-accent text-accent" : "justify-between"}
            >
              <span>{option}</span>
              {percentages ? <span className="text-xs text-white/60">{percentages[idx] ?? 0}%</span> : null}
            </Button>
          ))}
        </div>
        {selected === null ? (
          <p className="text-xs text-white/40">Stem en zie de crew live bewegen.</p>
        ) : xpMessage ? (
          <p className="text-xs text-emerald-400">{xpMessage}</p>
        ) : (
          <p className="text-xs text-white/50">Stem opgeslagen.</p>
        )}
      </div>
    </ChallengeCard>
  );
}
