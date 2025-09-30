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
  const friendId = String(formData.get("friendId") ?? "");
  if (!friendId) {
    return NextResponse.json({ error: "friendId verplicht" }, { status: 400 });
  }
  const supabase = getSupabaseRouteHandler();
  await supabase
    .from("friends")
    .update({ status: "accepted" })
    .eq("user_a", friendId)
    .eq("user_b", user.id);
  await supabase.from("friends").upsert({ user_a: user.id, user_b: friendId, status: "accepted" });
  return NextResponse.redirect(new URL("/friends", request.url));
}
