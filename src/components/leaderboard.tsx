import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { LeaderboardRealtime, LeaderboardEntry } from "@/components/leaderboard-realtime";

interface LeaderboardResponse {
  global: LeaderboardEntry[];
  friends: LeaderboardEntry[];
  demoMode?: boolean;
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
  const demoMode = Boolean(data.demoMode);
  return (
    <LeaderboardRealtime
      initialGlobal={data.global}
      initialFriends={data.friends}
      demoMode={demoMode}
      friendForm={
        demoMode
          ? null
          : (
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
            )
      }
    />
  );
}
