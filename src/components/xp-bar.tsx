interface Props {
  xp: number;
  level?: number;
}

export function XPBar({ xp, level = Math.floor(xp / 100) + 1 }: Props) {
  const progress = Math.min(100, (xp % 100));
  return (
    <div className="space-y-2 rounded-3xl border border-white/5 bg-white/5 p-4">
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>Level {level}</span>
        <span>{xp} XP</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
