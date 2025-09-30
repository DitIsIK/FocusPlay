import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NavTabs } from "@/components/nav-tabs";
import { XPBar } from "@/components/xp-bar";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { StreakDot } from "@/components/streak-dot";
import { TeamManager } from "@/components/team-manager";
import { ResetDemoButton } from "@/components/reset-demo-button";

interface ProfileResponse {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url?: string | null;
  premium_tier: "free" | "premium" | "pro";
  xp: number;
  streak_days: number;
  teams?: { id: string; name: string; role: string; invite_code: string | null; theme: string; is_private?: boolean }[];
  dailyRemaining: number | null;
  fact_read: boolean;
  demoMode?: boolean;
}

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const cookieStore = cookies();
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/profile`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store"
  });
  if (res.status === 401) {
    redirect("/");
  }
  if (!res.ok) {
    throw new Error("Profiel kon niet laden");
  }
  const profile = (await res.json()) as ProfileResponse;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 pb-24 pt-10">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">Profiel</h1>
            {profile.demoMode && (
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
                Demo
              </span>
            )}
          </div>
          <p className="text-sm text-white/60">
            Premium status: {profile.demoMode ? `demo (${profile.premium_tier})` : profile.premium_tier}
          </p>
        </div>
        <NavTabs />
      </header>
      <section className="space-y-6">
        <div>
          <p className="text-sm text-white/60">{profile.display_name ?? profile.email}</p>
          <p className="text-xs text-white/40">Streak: {profile.streak_days} dagen</p>
          <div className="flex gap-2 pt-2">
            {Array.from({ length: 7 }).map((_, idx) => (
              <StreakDot key={idx} active={idx < (profile.streak_days % 7)} />
            ))}
          </div>
        </div>
        <XPBar xp={profile.xp} />
        <div className="space-y-1 rounded-3xl border border-white/5 bg-white/5 p-4 text-sm text-white/70">
          <p className="flex items-center justify-between">
            <span>XP totaal</span>
            <span className="font-semibold text-white">{profile.xp}</span>
          </p>
          <p className="flex items-center justify-between">
            <span>Resterende kaarten vandaag</span>
            <span className="font-semibold text-white">
              {profile.dailyRemaining === null ? "∞" : profile.dailyRemaining}
            </span>
          </p>
          <p className="flex items-center justify-between">
            <span>Fact gelezen bonus</span>
            <span className="font-semibold text-white">
              {profile.fact_read ? "✓" : "○"}
            </span>
          </p>
        </div>
        {!profile.demoMode && profile.premium_tier !== "pro" && <UpgradeDialog />}
        {profile.demoMode && (
          <div className="pt-2">
            <ResetDemoButton />
          </div>
        )}
      </section>
      {!profile.demoMode && (
        <section className="space-y-3 text-sm text-white/60">
          <h2 className="text-lg font-semibold text-white">Abonnement beheren</h2>
          <p>Klik hieronder om je plan in Stripe te beheren.</p>
          <form method="POST" action="/api/stripe/portal">
            <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80">
              Open Customer Portal
            </button>
          </form>
        </section>
      )}
      <section className="space-y-3 text-sm text-white/60">
        <h2 className="text-lg font-semibold text-white">Team rooms</h2>
        {profile.demoMode ? (
          <div className="rounded-3xl border border-white/5 bg-white/5 p-6 text-xs text-white/60">
            Team rooms zijn niet actief in demo.
          </div>
        ) : (
          <TeamManager teams={profile.teams ?? []} tier={profile.premium_tier} />
        )}
      </section>
    </main>
  );
}
