import { addDays, startOfDay } from "date-fns";

export type Forecast = { date: string; count: number }[];

/** Group due-dates into 30 daily buckets starting at `today`. */
export function dueForecast(dueDates: Date[], days: number = 30, now: Date = new Date()): Forecast {
  const start = startOfDay(now);
  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const k = addDays(start, i).toISOString().slice(0, 10);
    buckets.set(k, 0);
  }
  for (const due of dueDates) {
    const k = startOfDay(due).toISOString().slice(0, 10);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([date, count]) => ({ date, count }));
}

/** Retention rate = % of reviews rated >= Good (3 or 4). */
export function retentionRate(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const good = ratings.filter((r) => r >= 3).length;
  return Math.round((good / ratings.length) * 1000) / 10;
}

export type HeatmapCell = { date: string; count: number };

/** Last-year daily heatmap. */
export function heatmap(reviewedAts: Date[], now: Date = new Date()): HeatmapCell[] {
  const start = startOfDay(addDays(now, -364));
  const cells: HeatmapCell[] = [];
  const map = new Map<string, number>();
  for (const d of reviewedAts) {
    const k = startOfDay(d).toISOString().slice(0, 10);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  for (let i = 0; i < 365; i++) {
    const day = addDays(start, i);
    const k = day.toISOString().slice(0, 10);
    cells.push({ date: k, count: map.get(k) ?? 0 });
  }
  return cells;
}
