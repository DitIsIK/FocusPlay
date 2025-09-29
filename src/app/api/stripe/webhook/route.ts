import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getSupabaseServiceRole } from "@/lib/auth";

export const config = {
  api: {
    bodyParser: false
  }
};

export async function POST(request: Request) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.STRIPE_WEBHOOK_SECRET ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ received: true });
  }
  const signature = headers().get("stripe-signature");
  const payload = await request.text();
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Signature ontbreekt" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
  }

  const supabase = getSupabaseServiceRole();

  if (event.type === "checkout.session.completed" || event.type === "customer.subscription.updated") {
    const session = event.data.object as { metadata?: Record<string, string>; status?: string };
    const tier = session.metadata?.tier ?? "free";
    const userId = session.metadata?.userId;
    if (userId) {
      await supabase
        .from("users")
        .update({ premium_tier: session.status === "canceled" ? "free" : tier })
        .eq("id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
