const WINDOW = 24 * 60 * 60 * 1000;

const memoryStore = new Map<string, { count: number; reset: number }>();

export function takeToken({
  key,
  limit
}: {
  key: string;
  limit: number;
}): { remaining: number; reset: number; blocked: boolean } {
  const now = Date.now();
  const bucket = memoryStore.get(key);
  if (!bucket || bucket.reset < now) {
    const next = { count: 1, reset: now + WINDOW };
    memoryStore.set(key, next);
    return { remaining: limit - 1, reset: next.reset, blocked: false };
  }
  if (bucket.count >= limit) {
    return { remaining: 0, reset: bucket.reset, blocked: true };
  }
  bucket.count += 1;
  memoryStore.set(key, bucket);
  return { remaining: limit - bucket.count, reset: bucket.reset, blocked: false };
}

export function resetToken(key: string) {
  memoryStore.delete(key);
}
