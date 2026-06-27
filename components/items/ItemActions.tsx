"use client";

import { useState, useTransition } from "react";
import { Archive, NotebookPen, Trash2 } from "lucide-react";
import { archiveItem, deleteItem, saveNotes } from "@/app/(authed)/items/actions";

export function ItemActions({ itemId, notes }: { itemId: string; notes: string | null }) {
  const [draft, setDraft] = useState(notes ?? "");
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  return (
    <section className="space-y-3">
      <details className="rounded-xl border border-[var(--color-border)]">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          <NotebookPen className="mr-1 inline h-3.5 w-3.5" /> My notes
        </summary>
        <div className="border-t border-[var(--color-border)] p-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="In one sentence: how does this connect to something you already know?"
            rows={4}
            className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
            <span>{savedAt ? "Saved" : "Markdown ok. Elaboration boosts retention."}</span>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await saveNotes(itemId, draft);
                  setSavedAt(Date.now());
                })
              }
              className="rounded-md border border-[var(--color-border)] px-2.5 py-1 hover:bg-[var(--color-accent)]"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </details>

      <div className="flex flex-wrap gap-2 text-xs">
        <form action={archiveItem.bind(null, itemId)}>
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2.5 py-1 hover:bg-[var(--color-accent)]"
          >
            <Archive className="h-3.5 w-3.5" /> Archive
          </button>
        </form>
        <form action={deleteItem.bind(null, itemId)}>
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-md border border-red-500/40 px-2.5 py-1 text-red-600 hover:bg-red-500/10 dark:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </form>
      </div>
    </section>
  );
}
