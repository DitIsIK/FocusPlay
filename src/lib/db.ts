import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { Database } from "@/types/database";

export function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        }
      },
      global: {
        headers: {
          "X-Client-Info": "focusplay-edge",
          "X-Forwarded-For": headers().get("x-forwarded-for") ?? undefined
        }
      }
    }
  );
}
