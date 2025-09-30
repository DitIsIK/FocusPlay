"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResetDemoButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      if (!res.ok) {
        setError("Kon demo niet resetten");
        return;
      }
      router.refresh();
    } catch (err) {
      setError("Kon demo niet resetten");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={reset}
        disabled={pending}
        className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Bezig…" : "Reset demo-gegevens"}
      </button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
