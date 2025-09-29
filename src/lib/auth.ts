import { createRouteHandlerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Database } from "@/types/database";

export function getSupabaseRouteHandler() {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  });
}

export async function requireUser() {
  const supabase = getSupabaseRouteHandler();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "Niet ingelogd" }), { status: 401 });
  }
  return session.user;
}

export function getSupabaseServiceRole() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  );
}
