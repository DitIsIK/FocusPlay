import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Challenge } from "@/types/challenge";

const themeLabels: Record<string, string> = {
  general: "Algemeen",
  sports: "Sport",
  gaming: "Gaming",
  productivity: "Productiviteit"
};

export function ChallengeCard({ challenge, children }: { challenge: Challenge; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs uppercase text-white/40">
        <span>{themeLabels[challenge.theme ?? "general"] ?? "Algemeen"}</span>
        <span>{challenge.type}</span>
      </div>
      {children}
    </Card>
  );
}
