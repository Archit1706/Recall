import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { STATE_LABELS } from "@/lib/fsrs";
import { formatRelativeShort } from "@/lib/utils";
import { ItemContent } from "@/components/items/ItemContent";
import { ItemActions } from "@/components/items/ItemActions";

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const item = await prisma.item.findFirst({
    where: { id, userId },
    include: {
      tags: { select: { name: true } },
      reviews: {
        orderBy: { reviewedAt: "desc" },
        take: 20,
        select: { id: true, rating: true, reviewedAt: true },
      },
    },
  });
  if (!item) notFound();

  const now = new Date();

  return (
    <div className="space-y-5">
      <Link
        href="/items"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
      >
        <ArrowLeft className="h-4 w-4" /> Library
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
          <span className="rounded bg-[var(--color-secondary)] px-1.5 py-0.5 font-mono uppercase">
            {item.contentType}
          </span>
          <span>{STATE_LABELS[item.state] ?? "New"}</span>
          <span>· Next review {formatRelativeShort(item.due, now)}</span>
          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 hover:text-[var(--color-foreground)]"
            >
              source <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 text-xs text-[var(--color-muted-foreground)]">
            {item.tags.map((t) => (
              <Link key={t.name} href={`/items?tag=${t.name}`}>
                #{t.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {item.aiSummary && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-secondary)]/40 p-4 text-sm">
          <div className="mb-1 text-xs font-medium text-[var(--color-muted-foreground)]">
            AI summary
          </div>
          <p>{item.aiSummary}</p>
          {Array.isArray(item.aiConcepts) && item.aiConcepts.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
              {(item.aiConcepts as string[]).map((c) => (
                <li key={c} className="rounded-full bg-[var(--color-background)] px-2 py-0.5">
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ItemContent contentType={item.contentType} rawContent={item.rawContent} sourceUrl={item.sourceUrl} />

      <ItemActions itemId={item.id} notes={item.notes} />

      {item.reviews.length > 0 && (
        <section className="rounded-2xl border border-[var(--color-border)]">
          <header className="border-b border-[var(--color-border)] px-4 py-2 text-sm font-medium">
            Review history
          </header>
          <ul className="divide-y divide-[var(--color-border)] text-sm">
            {item.reviews.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-4 py-2">
                <span className="text-[var(--color-muted-foreground)]">
                  {r.reviewedAt.toLocaleString()}
                </span>
                <span>
                  {(["", "Again", "Hard", "Good", "Easy"] as const)[r.rating] ?? "?"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
