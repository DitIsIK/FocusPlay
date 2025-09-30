"use client";

import { useEffect, useState } from "react";
import { Challenge } from "@/types/challenge";
import { ChallengeCard } from "@/components/challenge-card";
import { Button } from "@/components/ui/button";

interface Props {
  challenge: Challenge;
  onAnswer?: (params: { challengeId: string; answerIndex: number }) => Promise<{ correct: boolean; xpAwarded: number } | void>;
}

export function QuizCard({ challenge, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  useEffect(() => {
    setSelected(null);
    setResult(null);
    setXpAwarded(null);
    setLoading(false);
  }, [challenge.id]);

  if (!challenge.content.options || challenge.content.answerIndex === undefined || !challenge.content.question) {
    return null;
  }

  const handleSelect = async (index: number) => {
    if (loading || result !== null) return;
    setLoading(true);
    setSelected(index);
    const outcome = await onAnswer?.({ challengeId: challenge.id, answerIndex: index });
    const correct = outcome ? outcome.correct : index === challenge.content.answerIndex;
    if (outcome && typeof outcome.xpAwarded === "number") {
      setXpAwarded(outcome.xpAwarded);
    } else {
      setXpAwarded(correct ? 10 : 0);
    }
    setResult(correct);
    setLoading(false);
  };

  return (
    <ChallengeCard challenge={challenge}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">{challenge.content.question}</h3>
        <div className="grid gap-3">
          {challenge.content.options.map((option, idx) => (
            <Button
              key={idx}
              variant="outline"
              onClick={() => handleSelect(idx)}
              className={
                result === null
                  ? "justify-start"
                  : idx === challenge.content.answerIndex
                    ? "justify-start border-accent text-accent"
                    : idx === selected
                      ? "justify-start border-primary text-primary"
                      : "justify-start"
              }
              disabled={loading}
            >
              {option}
            </Button>
          ))}
        </div>
        {result !== null && (
          <p className="text-sm text-white/60">
            {result
              ? xpAwarded
                ? `Juist! +${xpAwarded} XP`
                : "Juist! Al geteld."
              : "Mis. Volgende kaart pakt je wel."}
          </p>
        )}
      </div>
    </ChallengeCard>
  );
}
