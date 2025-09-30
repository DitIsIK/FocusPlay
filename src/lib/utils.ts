import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export const THEMES = ["general", "sports", "gaming", "productivity"] as const;
export type Theme = (typeof THEMES)[number];

export const PREMIUM_TIERS = ["free", "premium", "pro"] as const;
export type PremiumTier = (typeof PREMIUM_TIERS)[number];

export const DAILY_LIMITS: Record<PremiumTier, number> = {
  free: 10,
  premium: Infinity,
  pro: Infinity
};

export const GENERATE_LIMITS: Record<PremiumTier, number> = {
  free: 30,
  premium: 200,
  pro: 500
};
