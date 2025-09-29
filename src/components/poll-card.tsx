"use client";

import { useState } from "react";
import { Challenge } from "@/types/challenge";
import { ChallengeCard } from "@/components/challenge-card";
import { Button } from "@/components/ui/button";

export function PollCard({ challenge, onVote }: { challenge: Challenge; onVote?: (choice: number) => Promise<number[]> | void }) {
  const [percentages, setPercentages] = useState<number[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const vote = async (choice: number) => {
    setSelected(choice);
    const response = await onVote?.(choice);
    if (Array.isArray(response)) {
      setPercentages(response);
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
              {percentages ? <span className="text-xs text-white/60">{percentages[idx]}%</span> : null}
            </Button>
          ))}
        </div>
        {selected === null && <p className="text-xs text-white/40">Stem en zie de crew live bewegen.</p>}
      </div>
    </ChallengeCard>
  );
}
