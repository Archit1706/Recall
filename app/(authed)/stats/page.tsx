import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { computeStreak } from "@/lib/streak";
import { dueForecast, heatmap, retentionRate } from "@/lib/stats";
import { Heatmap } from "@/components/stats/Heatmap";
import { Forecast } from "@/components/stats/Forecast";
import { STATE_LABELS } from "@/lib/fsrs";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const userId = await requireUserId();
  const now = new Date();

  const [items, reviews, allReviewsForRetention] = await Promise.all([
    prisma.item.findMany({
      where: { userId, archived: false },
      select: { due: true, state: true, reps: true, lapses: true, stability: true },
    }),
    prisma.review.findMany({
      where: { userId },
      orderBy: { reviewedAt: "desc" },
      take: 5000,
      select: { reviewedAt: true, rating: true },
    }),
    prisma.review.findMany({
      where: { userId, reviewedAt: { gt: new Date(now.getTime() - 30 * 86400_000) } },
      select: { rating: true },
    }),
  ]);

  const stateCounts: Record<string, number> = { New: 0, Learning: 0, Review: 0, Relearning: 0 };
  for (const it of items as { state: number }[]) {
    const label = STATE_LABELS[it.state] ?? "New";
    stateCounts[label] = (stateCounts[label] ?? 0) + 1;
  }

  const streak = computeStreak(reviews.map((r: { reviewedAt: Date }) => r.reviewedAt));
  const forecast = dueForecast(items.map((i: { due: Date }) => i.due));
  const cells = heatmap(reviews.map((r: { reviewedAt: Date }) => r.reviewedAt));
  const retention30d = retentionRate(
    allReviewsForRetention.map((r: { rating: number }) => r.rating),
  );
  const totalLapses = items.reduce(
    (acc: number, it: { lapses: number }) => acc + it.lapses,
    0,
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Your learning, in numbers.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-4">
        <Stat label="Items" value={items.length} />
        <Stat label="30-day retention" value={`${retention30d}%`} />
        <Stat label="Current streak" value={`${streak.current}d`} />
        <Stat label="Longest streak" value={`${streak.longest}d`} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">By state</h2>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {Object.entries(stateCounts).map(([k, v]) => (
            <div key={k} className="rounded-md border border-[var(--color-border)] py-2">
              <div className="text-base font-semibold">{v}</div>
              <div className="text-[var(--color-muted-foreground)]">{k}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Lapses across all items: <span className="tabular-nums">{totalLapses}</span>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Next 30 days</h2>
        <Forecast data={forecast} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Last year</h2>
        <div className="overflow-x-auto">
          <Heatmap cells={cells} />
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Every cell is a day; brighter means more reviews.
        </p>
      </section>

      <Link
        href="/settings"
        className="inline-block text-sm text-[var(--color-muted-foreground)] underline-offset-2 hover:underline"
      >
        Tune reminders & AI key →
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] p-4">
      <div className="text-xs text-[var(--color-muted-foreground)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
