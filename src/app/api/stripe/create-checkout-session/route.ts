import { NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_LOOKUP } from "@/lib/stripe";
import { requireUser, getSupabaseRouteHandler } from "@/lib/auth";

export async function POST(request: Request) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json({ url: "https://billing.stripe.com/p/login/test" });
  }
  const user = await requireUser();
  const formData = await request.formData();
  const tier = String(formData.get("tier") ?? "premium");
  const price = STRIPE_PRICE_LOOKUP[tier];
  if (!price) {
    return NextResponse.json({ error: "Onbekend tier" }, { status: 400 });
  }
  const supabase = getSupabaseRouteHandler();
  const { data: profile } = await supabase
    .from("users")
    .select("email, stripe_customer_id")
    .eq("id", user.id)
    .single();
  let customerId = profile?.stripe_customer_id ?? undefined;
  if (!customerId && profile?.email) {
    const customer = await stripe.customers.create({ email: profile.email });
    customerId = customer.id;
    await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    customer_email: customerId ? undefined : profile?.email,
    line_items: [
      {
        price,
        quantity: 1
      }
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    metadata: {
      userId: user.id,
      tier
    }
  });
  return NextResponse.json({ url: session.url });
}
