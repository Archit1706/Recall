/**
 * Round-robin interleave by primary tag so a review session feels varied.
 * Interleaving (vs blocked practice on one topic) measurably improves long-term
 * retention — Rohrer & Taylor 2007. Free win.
 */
export function interleaveByTag<T extends { tags: { name: string }[] }>(items: T[]): T[] {
  const buckets = new Map<string, T[]>();
  for (const it of items) {
    const key = it.tags[0]?.name ?? "__untagged";
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(it);
  }
  const queues = [...buckets.values()];
  const out: T[] = [];
  while (queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      const next = q.shift();
      if (next) out.push(next);
    }
  }
  return out;
}
