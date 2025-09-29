import { z } from "zod";
import { PREMIUM_TIERS } from "@/lib/utils";

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  avatar_url: z.string().url().nullable().or(z.literal("")),
  premium_tier: z.enum(PREMIUM_TIERS),
  xp: z.number().int(),
  streak_days: z.number().int(),
  last_action: z.string().nullable(),
  cards_consumed_today: z.number().int().nullable(),
  last_card_reset: z.string().nullable()
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
