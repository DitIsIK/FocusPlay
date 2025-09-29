import { Suspense } from "react";
import { NavTabs } from "@/components/nav-tabs";
import { Leaderboard } from "@/components/leaderboard";

export const dynamic = "force-dynamic";

export default function FriendsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 pb-24 pt-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Crew leaderboard</h1>
          <p className="text-sm text-white/60">Daag vrienden uit via je handle.</p>
        </div>
        <NavTabs />
      </header>
      <Suspense fallback={<p className="text-white/40">Laden…</p>}>
        <Leaderboard />
      </Suspense>
    </main>
  );
}
