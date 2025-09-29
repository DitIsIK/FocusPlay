import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  xp: number;
  streak_days: number;
  avatar_url: string | null;
}

interface LeaderboardResponse {
  global: LeaderboardEntry[];
  friends: LeaderboardEntry[];
}

export async function Leaderboard() {
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const headers: Record<string, string> = {};
  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/leaderboard?scope=all`, {
    headers,
    cache: "no-store"
  });
  if (!res.ok) {
    return <p className="text-white/40">Kon leaderboard niet laden.</p>;
  }
  const data = (await res.json()) as LeaderboardResponse;
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold">Global</h2>
        <LeaderboardTable entries={data.global} emptyCopy="Nog geen legendes." />
      </section>
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Friends</h2>
          <form method="POST" action="/api/friends/request" className="flex gap-2 text-xs text-white/60">
            <input
              name="handle"
              placeholder="@handle"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80"
            />
            <Button type="submit" variant="outline" className="px-3 text-xs">
              Voeg toe
            </Button>
          </form>
        </div>
        <LeaderboardTable entries={data.friends} emptyCopy="Nodig iemand uit. Minder doom samen." />
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
