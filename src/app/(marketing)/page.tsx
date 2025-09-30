import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NavTabs } from "@/components/nav-tabs";

export default function LandingPage() {
  const demoMode = process.env.DEMO_MODE === "true";
  return (
    <main className="min-h-screen px-6 py-16 lg:px-24">
      <div className="mx-auto max-w-3xl text-balance">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">Scroll slim, niet dom.</p>
        <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
          Minder doom. Meer doén.
        </h1>
        <p className="mt-4 text-lg text-white/70">
          FocusPlay geeft je snackable micro-challenges die je brein wakker houden. Quiz, polls en facts —
          allemaal zonder ads.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90"
          >
            {demoMode ? "Doorgaan als demo-gebruiker" : "Speel nu"}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/privacy" className="text-sm text-white/50 hover:text-white">
            Privacybeleid
          </Link>
          <Link href="/terms" className="text-sm text-white/50 hover:text-white">
            Voorwaarden
          </Link>
        </div>
      </div>
      <section className="mt-16 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur">
          <h2 className="text-xl font-semibold">Premium ontgrendelt onbeperkt spelen.</h2>
          <p className="mt-3 text-sm text-white/60">
            Free = 10 kaarten/dag. Premium = onbeperkt scrollen + Create. Pro = team rooms en thematische filters.
          </p>
          {demoMode && <p className="mt-3 text-xs text-white/40">Demo geeft je alvast een voorproef zonder login.</p>}
        </div>
        <div className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur">
          <h2 className="text-xl font-semibold">Realtime met je crew.</h2>
          <p className="mt-3 text-sm text-white/60">
            Volg polls live, houd streaks scherp en klim het vrienden-leaderboard op.
          </p>
        </div>
      </section>
      <div className="mt-16">
        <NavTabs />
      </div>
    </main>
  );
}
