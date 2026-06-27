import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { ReviewSession } from "@/components/review/ReviewSession";
import { interleaveByTag } from "@/lib/interleave";

export const dynamic = "force-dynamic";

type Search = { mode?: "cram"; tag?: string };

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const userId = await requireUserId();
  const sp = await searchParams;
  const now = new Date();
  const cram = sp.mode === "cram";

  const where: Record<string, unknown> = { userId, archived: false };
  if (!cram) Object.assign(where, { due: { lte: now } });
  if (sp.tag) Object.assign(where, { tags: { some: { name: sp.tag, userId } } });

  const itemsRaw = await prisma.item.findMany({
    where,
    orderBy: cram ? { lastReview: { sort: "asc", nulls: "first" } } : { due: "asc" },
    take: cram ? 200 : 100,
    include: {
      tags: { select: { name: true } },
    },
  });

  const items = cram ? itemsRaw : interleaveByTag(itemsRaw);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <CalendarCheck className="mx-auto h-10 w-10 text-[var(--color-muted-foreground)]" />
        <h1 className="mt-3 text-xl font-semibold">All caught up</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Nothing {sp.tag ? `tagged #${sp.tag} ` : ""}due right now.
        </p>
        <Link
          href="/today"
          className="mt-4 inline-block text-sm font-medium underline-offset-2 hover:underline"
        >
          ← Back to today
        </Link>
      </div>
    );
  }

  const payload = items.map((it) => ({
    id: it.id,
    title: it.title,
    contentType: it.contentType,
    rawContent: it.rawContent,
    sourceUrl: it.sourceUrl,
    reviewMode: it.reviewMode,
    aiEnabled: it.aiEnabled,
    aiQuestions: (it.aiQuestions ?? null) as { q: string; a: string }[] | null,
    aiSummary: it.aiSummary,
    state: it.state,
    reps: it.reps,
    tags: it.tags.map((t) => t.name),
  }));

  return <ReviewSession items={payload} cram={cram} />;
}
