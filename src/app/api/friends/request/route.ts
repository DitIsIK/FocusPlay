import { NextResponse } from "next/server";
import { getSupabaseRouteHandler, requireUser } from "@/lib/auth";

export async function POST(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.redirect(new URL("/friends", request.url));
  }
  const user = await requireUser();
  const formData = await request.formData();
  const handle = String(formData.get("handle") ?? "").replace(/^@/, "").trim();
  if (!handle) {
    return NextResponse.json({ error: "Handle verplicht" }, { status: 400 });
  }
  const supabase = getSupabaseRouteHandler();
  const { data: target } = await supabase
    .from("users")
    .select("id")
    .ilike("display_name", handle)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }
  await supabase.from("friends").upsert({ user_a: user.id, user_b: target.id, status: "pending" });
  return NextResponse.redirect(new URL("/friends", request.url));
}
