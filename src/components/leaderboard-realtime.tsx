"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  xp: number;
  streak_days: number;
  avatar_url: string | null;
}

interface LeaderboardRealtimeProps {
  initialGlobal: LeaderboardEntry[];
  initialFriends: LeaderboardEntry[];
  friendForm?: ReactNode;
  demoMode?: boolean;
}

export function LeaderboardRealtime({ initialGlobal, initialFriends, friendForm, demoMode }: LeaderboardRealtimeProps) {
  const [global, setGlobal] = useState(initialGlobal);
  const [friends, setFriends] = useState(initialFriends);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leaderboard?scope=all", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { global: LeaderboardEntry[]; friends: LeaderboardEntry[] };
      setGlobal(data.global);
      setFriends(data.friends);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (demoMode) {
      return;
    }
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const channel = client
      .channel("leaderboard-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "friends" }, () => {
        refresh();
      })
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [refresh, demoMode]);

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Global</h2>
          {!demoMode && loading && <span className="text-xs text-white/40">live…</span>}
        </div>
        {demoMode && (
          <p className="mt-2 text-xs text-white/50">Demo leaderboard. Scores resetten wanneer je demo herstart.</p>
        )}
        <LeaderboardTable entries={global} emptyCopy="Nog geen legendes." />
      </section>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Friends</h2>
          {friendForm}
        </div>
        {demoMode && <p className="mt-2 text-xs text-white/50">Vrienduitnodigingen zijn uitgeschakeld in demo.</p>}
        <LeaderboardTable entries={friends} emptyCopy="Nodig iemand uit. Minder doom samen." />
      </section>
    </div>
  );
}

function LeaderboardTable({ entries, emptyCopy }: { entries: LeaderboardEntry[]; emptyCopy: string }) {
  if (!entries.length) {
    return <p className="mt-4 text-sm text-white/50">{emptyCopy}</p>;
  }
  return (
    <ul className="mt-4 space-y-3 text-sm">
      {entries.map((entry, idx) => (
        <li key={entry.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50">#{idx + 1}</span>
            <span className="font-medium">{entry.display_name ?? "Anoniem"}</span>
          </div>
          <div className="text-xs text-white/60">{entry.xp} XP · {entry.streak_days} streak</div>
        </li>
      ))}
    </ul>
  );
}
