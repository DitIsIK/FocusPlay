import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";

export async function POST(request: Request) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/profile`);
  }
  const user = await requireUser();
  const supabase = getSupabaseRouteHandler();
  const { data: profile } = await supabase.from("users").select("stripe_customer_id").eq("id", user.id).single();
  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "Geen klant gevonden" }, { status: 400 });
  }
  const portal = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`
  });
  return NextResponse.redirect(portal.url ?? `${process.env.NEXT_PUBLIC_APP_URL}/profile`);
}
