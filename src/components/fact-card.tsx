import { Challenge } from "@/types/challenge";
import { ChallengeCard } from "@/components/challenge-card";

export function FactCard({ challenge }: { challenge: Challenge }) {
  if (!challenge.content.fact) {
    return null;
  }
  return (
    <ChallengeCard challenge={challenge}>
      <p className="text-lg text-white/80">{challenge.content.fact}</p>
      {challenge.content.source && (
        <p className="text-xs text-white/30">Bron: {challenge.content.source}</p>
      )}
    </ChallengeCard>
  );
}
