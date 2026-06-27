/**
 * Computes the current streak (consecutive days ending today) and longest streak
 * from a list of review timestamps. Days are bucketed in the system timezone
 * by default; callers may pass a tz string from the user's profile to override.
 */
export type StreakResult = { current: number; longest: number };

function dayKey(date: Date, tz?: string): string {
  if (!tz) {
    return date.toISOString().slice(0, 10);
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return parts;
}

export function computeStreak(reviewedAts: Date[], tz?: string, now: Date = new Date()): StreakResult {
  if (reviewedAts.length === 0) return { current: 0, longest: 0 };

  const days = new Set<string>();
  for (const d of reviewedAts) days.add(dayKey(d, tz));

  // Current streak: walk backwards from today (or yesterday — we don't break a streak
  // until midnight without a review). If today has a review, start counting today;
  // else start from yesterday (we want streak = N if the user has reviewed N days in
  // a row, including yesterday and the user is still mid-grace).
  let current = 0;
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor, tz))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(dayKey(cursor, tz))) {
      return { current: 0, longest: longestRun(days) };
    }
  }
  while (days.has(dayKey(cursor, tz))) {
    current += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { current, longest: Math.max(current, longestRun(days)) };
}

function longestRun(days: Set<string>): number {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    if (prev && isNextDay(prev, d)) run += 1;
    else run = 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

function isNextDay(a: string, b: string): boolean {
  const ad = new Date(a + "T00:00:00Z");
  const bd = new Date(b + "T00:00:00Z");
  return bd.getTime() - ad.getTime() === 86_400_000;
}
