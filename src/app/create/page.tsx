import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NavTabs } from "@/components/nav-tabs";
import { THEMES } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProfileResponse {
  premium_tier: "free" | "premium" | "pro";
}

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const cookieStore = cookies();
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/profile`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store"
  });
  if (res.status === 401) {
    redirect("/");
  }
  if (!res.ok) {
    throw new Error("Kon profiel niet laden");
  }
  const profile = (await res.json()) as ProfileResponse;
  const isPremium = profile.premium_tier !== "free";

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 pb-24 pt-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Create</h1>
          <p className="text-sm text-white/60">Drop je eigen kaart. Premium only.</p>
        </div>
        <NavTabs />
      </header>
      {!isPremium ? (
        <div className="rounded-3xl border border-white/5 bg-white/5 p-6 text-sm">
          <p className="text-white/80">Premium ontgrendelt onbeperkt scrollen.</p>
          <p className="text-white/50">Upgrade om je eigen challenges te droppen.</p>
        </div>
      ) : (
        <form
          className="space-y-6 rounded-3xl border border-white/5 bg-white/5 p-6"
          action="/api/challenge"
          method="POST"
        >
          <label className="flex flex-col gap-2 text-sm text-white/80">
            Thema
            <select name="theme" className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
              {THEMES.map((theme) => (
                <option key={theme}>{theme}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/80">
            Type
            <select name="type" className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
              <option value="quiz">quiz</option>
              <option value="poll">poll</option>
              <option value="fact">fact</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/80">
            Content
            <textarea
              name="payload"
              placeholder="JSON payload volgens schema"
              className="min-h-[160px] rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs"
            />
          </label>
          <Button type="submit" className="w-full">
            Submit naar moderatie
          </Button>
        </form>
      )}
    </main>
  );
}
