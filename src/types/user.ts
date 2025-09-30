import { z } from "zod";
import { PREMIUM_TIERS } from "@/lib/utils";

export const TeamSummarySchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["owner", "member"]).default("member"),
  name: z.string(),
  theme: z.string(),
  invite_code: z.string().nullable(),
  is_private: z.boolean().optional()
});

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
  last_card_reset: z.string().nullable(),
  teams: z.array(TeamSummarySchema).optional()
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
