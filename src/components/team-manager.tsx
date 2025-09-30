"use client";

import { FormEvent, useState } from "react";
import { THEMES } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TeamSummary {
  id: string;
  name: string;
  role: string;
  invite_code: string | null;
  theme: string;
  is_private?: boolean;
}

interface TeamManagerProps {
  teams: TeamSummary[];
  tier: "free" | "premium" | "pro";
}

export function TeamManager({ teams, tier }: TeamManagerProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  if (tier !== "pro") {
    return (
      <div className="space-y-3 rounded-3xl border border-white/5 bg-white/5 p-6 text-sm text-white/70">
        <p>Team rooms zijn voor Pro. Upgrade om squads tot 20 spelers te bouwen.</p>
      </div>
    );
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("teamName"),
          theme: formData.get("teamTheme"),
          isPrivate: formData.get("teamPrivate") === "on"
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? "Team aanmaken faalde");
      } else {
        setStatus("Team aangemaakt. Refresh om hem in de feed te zien.");
        event.currentTarget.reset();
      }
    } catch (error) {
      setStatus("Kon team niet aanmaken");
    } finally {
      setIsBusy(false);
    }
  };

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: formData.get("inviteCode") })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? "Joinen faalde");
      } else {
        setStatus("Team gejoined. Refresh voor de nieuwste kaarten.");
        event.currentTarget.reset();
      }
    } catch (error) {
      setStatus("Kon team niet joinen");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/5 bg-white/5 p-6 text-sm text-white/70">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-white">Jouw teams</h3>
        {teams.length === 0 ? (
          <p className="text-xs text-white/50">Nog geen crews. Maak er één of join met een invite.</p>
        ) : (
          <ul className="space-y-2 text-xs text-white/60">
            {teams.map((team) => (
              <li key={team.id} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium text-white">{team.name}</span>
                    <span className="ml-2 text-white/40">{team.theme}</span>
                    <span className="ml-2 text-white/40">{team.role}</span>
                  </div>
                  {team.invite_code && team.role === "owner" && (
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-white/60">
                      Invite: {team.invite_code}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <form onSubmit={handleCreate} className="space-y-3">
        <h4 className="text-sm font-semibold text-white">Nieuw team</h4>
        <input
          required
          name="teamName"
          placeholder="Naam"
          className="w-full rounded-full border border-white/10 bg-black/40 px-3 py-2 text-white"
        />
        <select name="teamTheme" className="w-full rounded-full border border-white/10 bg-black/40 px-3 py-2 text-white">
          {THEMES.map((theme) => (
            <option key={theme}>{theme}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-white/60">
          <input type="checkbox" name="teamPrivate" className="rounded border-white/10 bg-black/40" />
          Alleen invite
        </label>
        <Button type="submit" className="w-full" disabled={isBusy}>
          Maak team
        </Button>
      </form>
      <form onSubmit={handleJoin} className="space-y-3">
        <h4 className="text-sm font-semibold text-white">Join via code</h4>
        <input
          required
          name="inviteCode"
          placeholder="invite"
          className="w-full rounded-full border border-white/10 bg-black/40 px-3 py-2 text-white"
        />
        <Button type="submit" variant="outline" className="w-full" disabled={isBusy}>
          Join team
        </Button>
      </form>
      {status && <p className="text-xs text-white/50">{status}</p>}
    </div>
  );
}
