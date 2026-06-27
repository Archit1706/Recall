import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { STATE_LABELS } from "@/lib/fsrs";
import { formatRelativeShort } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; filter?: string }>;
}) {
  const userId = await requireUserId();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const tagName = sp.tag ?? "";
  const filter = sp.filter ?? "all";
  const now = new Date();

  const where: Record<string, unknown> = { userId, archived: false };
  if (q) {
    Object.assign(where, {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { rawContent: { contains: q, mode: "insensitive" } },
        { extractedText: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (tagName) {
    Object.assign(where, { tags: { some: { name: tagName, userId } } });
  }
  if (filter === "due") Object.assign(where, { due: { lte: now } });
  if (filter === "overdue")
    Object.assign(where, { due: { lt: new Date(now.getTime() - 86400_000) } });
  if (filter === "new") Object.assign(where, { reps: 0 });
  if (filter === "recent")
    Object.assign(where, { createdAt: { gt: new Date(now.getTime() - 7 * 86400_000) } });

  const [items, tags] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { due: "asc" },
      take: 200,
      include: { tags: { select: { name: true } } },
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>
        <Link
          href="/add"
          className="inline-flex items-center gap-1 rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary-foreground)]"
        >
          <Plus className="h-4 w-4" /> Add
        </Link>
      </header>

      <form className="relative" action="/items" method="get">
        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title, content, or PDFs"
          className="w-full rounded-md border border-[var(--color-border)] bg-transparent py-2 pr-3 pl-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
        />
        {tagName && <input type="hidden" name="tag" value={tagName} />}
        {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
      </form>

      <div className="flex flex-wrap gap-1.5">
        {(["all", "due", "overdue", "new", "recent"] as const).map((f) => {
          const active = f === filter;
          const href = new URLSearchParams();
          if (q) href.set("q", q);
          if (tagName) href.set("tag", tagName);
          if (f !== "all") href.set("filter", f);
          return (
            <Link
              key={f}
              href={`/items?${href.toString()}`}
              className={`rounded-full border px-2.5 py-0.5 text-xs ${
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-muted-foreground)]"
              }`}
            >
              {f}
            </Link>
          );
        })}
        {tags.length > 0 && (
          <span className="mx-1 text-xs text-[var(--color-muted-foreground)]">·</span>
        )}
        {tags.map((t) => {
          const active = tagName === t.name;
          const href = new URLSearchParams();
          if (q) href.set("q", q);
          if (filter !== "all") href.set("filter", filter);
          if (!active) href.set("tag", t.name);
          return (
            <Link
              key={t.id}
              href={`/items?${href.toString()}`}
              className={`rounded-full border px-2.5 py-0.5 text-xs ${
                active
                  ? "border-[var(--color-primary)] bg-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-muted-foreground)]"
              }`}
            >
              #{t.name}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-12 text-center text-sm text-[var(--color-muted-foreground)]">
          {q || tagName || filter !== "all" ? (
            "Nothing matches those filters."
          ) : (
            <>
              <p>Your library is empty.</p>
              <Link
                href="/add"
                className="mt-2 inline-flex items-center gap-1 underline-offset-2 hover:underline"
              >
                <Plus className="h-4 w-4" /> Add your first item
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)]">
          {items.map((it) => {
            const overdue = it.due.getTime() < now.getTime();
            return (
              <li key={it.id}>
                <Link
                  href={`/items/${it.id}`}
                  className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-3 transition-colors hover:bg-[var(--color-accent)]"
                >
                  <div className="truncate text-sm font-medium">{it.title}</div>
                  <div
                    className={`shrink-0 text-xs tabular-nums ${
                      overdue
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-[var(--color-muted-foreground)]"
                    }`}
                  >
                    {formatRelativeShort(it.due, now)}
                  </div>
                  <div className="col-span-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--color-muted-foreground)]">
                    <span className="rounded bg-[var(--color-secondary)] px-1.5 py-0.5 font-mono uppercase">
                      {it.contentType}
                    </span>
                    <span>{STATE_LABELS[it.state] ?? "New"}</span>
                    {it.tags.map((t) => (
                      <span key={t.name}>#{t.name}</span>
                    ))}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
