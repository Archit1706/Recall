"use client";

import { useState, useTransition } from "react";
import { Download, Upload } from "lucide-react";
import { bulkImport } from "@/app/(authed)/settings/import-actions";

export function ImportExport() {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--color-border)] p-4">
      <header>
        <h2 className="text-sm font-medium">Import &amp; export</h2>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Bring stuff in, take it with you.
        </p>
      </header>

      <div className="space-y-2">
        <label className="text-xs font-medium">
          Bulk add — one URL or note per line
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder={"https://example.com/post\nA fact I learned today\n# A markdown idea"}
          className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
        />
        <div className="flex items-center justify-between">
          {result && <span className="text-xs text-[var(--color-muted-foreground)]">{result}</span>}
          <button
            type="button"
            disabled={pending || !text.trim()}
            onClick={() =>
              start(async () => {
                const r = await bulkImport(text);
                setResult(`Imported ${r.created} of ${r.total}.`);
                setText("");
              })
            }
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs hover:bg-[var(--color-accent)] disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href="/api/export?format=json"
          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs hover:bg-[var(--color-accent)]"
        >
          <Download className="h-3.5 w-3.5" /> Export JSON
        </a>
        <a
          href="/api/export?format=anki"
          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs hover:bg-[var(--color-accent)]"
        >
          <Download className="h-3.5 w-3.5" /> Export for Anki
        </a>
      </div>
    </section>
  );
}
