import { Suspense } from "react";
import { NavTabs } from "@/components/nav-tabs";
import { FeedShell } from "@/components/feed-shell";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 pb-24 pt-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">FocusPlay</h1>
          <p className="text-sm text-white/60">10 kaarten/dag. Gebruik ze wijs.</p>
        </div>
        <NavTabs />
      </header>
      <Suspense fallback={<p className="text-white/40">Feed laden…</p>}>
        <FeedShell />
      </Suspense>
    </main>
  );
}
