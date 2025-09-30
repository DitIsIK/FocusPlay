import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
  appInfo: {
    name: "FocusPlay",
    version: "0.1.0"
  }
});

export const STRIPE_PRICE_LOOKUP: Record<string, string> = {
  free: process.env.STRIPE_PRICE_FREE ?? "focusplay_free",
  premium: process.env.STRIPE_PRICE_PREMIUM ?? "focusplay_premium_monthly",
  pro: process.env.STRIPE_PRICE_PRO ?? "focusplay_pro_monthly"
};
