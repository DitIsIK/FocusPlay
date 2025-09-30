"use client";

import { useEffect, useState } from "react";

import { Challenge } from "@/types/challenge";
import { ChallengeCard } from "@/components/challenge-card";

interface FactCardProps {
  challenge: Challenge;
  alreadyRead: boolean;
  onMarkRead: () => Promise<
    | { alreadyCounted?: boolean; xpDelta?: number; error?: string }
    | { error: string }
    | undefined
  >;
}

export function FactCard({ challenge, alreadyRead, onMarkRead }: FactCardProps) {
  const [read, setRead] = useState(alreadyRead);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(alreadyRead ? "✓ Al geteld" : null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRead(alreadyRead);
    if (alreadyRead) {
      setMessage("✓ Al geteld");
    }
  }, [alreadyRead]);

  if (!challenge.content.fact) {
    return null;
  }

  const handleClick = async () => {
    if (read || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await onMarkRead();
      if (result && "error" in result && result.error) {
        setError(result.error);
        return;
      }
      const alreadyCounted = Boolean(result?.alreadyCounted);
      const gained = typeof result?.xpDelta === "number" ? result.xpDelta : 0;
      setMessage(alreadyCounted || gained === 0 ? "✓ Al geteld" : "+3 XP");
      setRead(true);
    } catch {
      setError("Kon fact niet bijwerken");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChallengeCard challenge={challenge}>
      <p className="text-lg text-white/80">{challenge.content.fact}</p>
      {challenge.content.source && (
        <p className="text-xs text-white/30">Bron: {challenge.content.source}</p>
      )}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          disabled={read || loading}
          onClick={handleClick}
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80 transition hover:border-white/30 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/40"
        >
          {loading ? "Bezig…" : read ? message ?? "✓ Fact gelezen" : "Gelezen (+3 XP)"}
        </button>
        {message && read && !loading && (
          <span className="text-xs text-emerald-400">{message}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </ChallengeCard>
  );
}
