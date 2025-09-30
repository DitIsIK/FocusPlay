interface Props {
  active: boolean;
}

export function StreakDot({ active }: Props) {
  return (
    <span
      className={`inline-block h-3 w-3 rounded-full ${active ? "bg-accent" : "bg-white/10"}`}
      aria-hidden
    />
  );
}
