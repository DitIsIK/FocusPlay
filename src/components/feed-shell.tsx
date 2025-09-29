import { cookies } from "next/headers";
import { FeedList } from "@/components/feed-list";
import { Challenge, ChallengeSchema } from "@/types/challenge";

interface FeedResponse {
  items: Challenge[];
  nextCursor: string | null;
  xp: number;
  streak: number;
  premium: "free" | "premium" | "pro";
  dailyRemaining: number | null;
}

export async function FeedShell() {
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const headers: Record<string, string> = {};
  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/feed`, {
    headers,
    cache: "no-store"
  });
  if (!res.ok) {
    return <p className="text-white/50">Kon feed niet laden.</p>;
  }
  const data = (await res.json()) as FeedResponse;
  const items = data.items.map((item) => ChallengeSchema.parse(item));
  return <FeedList initialData={{ ...data, items }} />;
}
