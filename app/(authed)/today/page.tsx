import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCheck, Flame, Plus, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { computeStreak } from "@/lib/streak";
import { formatRelativeShort } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const userId = await requireUserId();
  const now = new Date();

  const [dueItems, totalItems, recentReviews, randomCandidates] = await Promise.all([
    prisma.item.findMany({
      where: { userId, archived: false, due: { lte: now } },
      orderBy: { due: "asc" },
      take: 5,
      select: { id: true, title: true, due: true, reviewMode: true },
    }),
    prisma.item.count({ where: { userId, archived: false } }),
    prisma.review.findMany({
      where: { userId },
      orderBy: { reviewedAt: "desc" },
      take: 60,
      select: { reviewedAt: true },
    }),
    prisma.item.findMany({
      where: {
        userId,
        archived: false,
        due: { gt: now },
        createdAt: { lt: new Date(now.getTime() - 30 * 86400_000) },
      },
      select: { id: true },
      take: 50,
    }),
  ]);

  const dueCount = await prisma.item.count({
    where: { userId, archived: false, due: { lte: now } },
  });
  const streak = computeStreak(recentReviews.map((r: { reviewedAt: Date }) => r.reviewedAt));

  async function startRandomRefresher() {
    "use server";
    const userId = await requireUserId();
    const now = new Date();
    const candidates = await prisma.item.findMany({
      where: {
        userId,
        archived: false,
        due: { gt: now },
        createdAt: { lt: new Date(now.getTime() - 30 * 86400_000) },
      },
      select: { id: true },
    });
    if (candidates.length === 0) return;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    redirect(`/items/${pick.id}?from=refresher`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {dueCount === 0
              ? totalItems === 0
                ? "Nothing in your library yet. Add something you learned."
                : "Nothing due. Quiet brain ✨"
              : `${dueCount} ${dueCount === 1 ? "thing" : "things"} to recall.`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="tabular-nums">{streak.current}-day streak</span>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={dueCount > 0 ? "/review" : "/add"}
          className="group rounded-2xl border border-[var(--color-border)] p-5 transition-colors hover:bg-[var(--color-accent)]"
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CalendarCheck className="h-4 w-4" />
            {dueCount > 0 ? "Start review" : "Add an item"}
          </div>
          <div className="text-2xl font-semibold">
            {dueCount > 0 ? `${dueCount} due` : "Capture something"}
          </div>
          <div className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            {dueCount > 0 ? "~30s per card · keyboard 1–4 to rate" : "Paste a link, snippet, idea"}
          </div>
        </Link>

        <form
          action={startRandomRefresher}
          className="rounded-2xl border border-[var(--color-border)] p-5"
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Random refresher
          </div>
          <div className="text-2xl font-semibold">
            {randomCandidates.length > 0 ? "Something old" : "Nothing yet"}
          </div>
          <div className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            {randomCandidates.length > 0
              ? "A non-due item from >30 days ago. Combats interference."
              : "Available once items are older than 30 days."}
          </div>
          {randomCandidates.length > 0 && (
            <button
              type="submit"
              className="mt-3 text-sm font-medium underline-offset-2 hover:underline"
            >
              Surprise me →
            </button>
          )}
        </form>
      </div>

      <section className="rounded-2xl border border-[var(--color-border)]">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-sm font-medium">Up next</h2>
          {dueItems.length > 0 && (
            <Link
              href="/review"
              className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              Review all →
            </Link>
          )}
        </header>
        {dueItems.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]">
            <Link
              href="/add"
              className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
            >
              <Plus className="h-4 w-4" /> Add your first item
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {dueItems.map((it: { id: string; title: string; due: Date }) => (
              <li key={it.id}>
                <Link
                  href={`/items/${it.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--color-accent)]"
                >
                  <span className="truncate text-sm font-medium">{it.title}</span>
                  <span className="shrink-0 text-xs text-[var(--color-muted-foreground)]">
                    {formatRelativeShort(it.due, now)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
