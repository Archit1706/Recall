"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Sparkles } from "lucide-react";
import { detectKind, firstUrl } from "@/lib/content";
import { saveItem, type SaveState } from "@/app/(authed)/add/actions";

type Tag = { id: string; name: string; color: string | null };

const REVIEW_MODES = [
  { value: "RECALL_BUTTONS", label: "Recall", hint: "Think → reveal → rate" },
  { value: "FLIP", label: "Flip", hint: "Title front, content back" },
  { value: "TYPE", label: "Type", hint: "Type the answer" },
  { value: "AI_QUIZ", label: "AI quiz", hint: "Claude asks & grades" },
] as const;

export function AddItemForm({
  existingTags,
  prefill,
}: {
  existingTags: Tag[];
  prefill: { title: string; content: string };
}) {
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [content, setContent] = useState(prefill.content);
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [state, action] = useActionState<SaveState | null, FormData>(saveItem, null);

  const kind = detectKind(content);
  const url = firstUrl(content);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        (document.getElementById("add-item-form") as HTMLFormElement | null)?.requestSubmit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function addTag(name: string) {
    const n = name.trim().toLowerCase();
    if (!n) return;
    if (tagNames.includes(n)) return;
    setTagNames((prev) => [...prev, n]);
    setTagInput("");
  }

  function removeTag(name: string) {
    setTagNames((prev) => prev.filter((t) => t !== name));
  }

  return (
    <form id="add-item-form" action={action} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          ref={titleRef}
          id="title"
          name="title"
          required
          defaultValue={prefill.title}
          maxLength={300}
          placeholder="e.g. Spaced repetition: optimal forgetting curve"
          className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="rawContent" className="text-sm font-medium">
            Content
          </label>
          <KindBadge kind={kind} url={url} />
        </div>
        <textarea
          ref={contentRef}
          id="rawContent"
          name="rawContent"
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          maxLength={50_000}
          placeholder="Paste a link, markdown, code, or a few sentences."
          className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
        />
        <p className="text-xs text-[var(--color-muted-foreground)]">
          We&apos;ll detect the type at save time. PDFs get text extracted, links get an
          OpenGraph preview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="learnedAt" className="text-sm font-medium">
            Learned on
          </label>
          <input
            type="date"
            id="learnedAt"
            name="learnedAt"
            defaultValue={todayIso}
            max={todayIso}
            className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          />
        </div>
        <div className="space-y-2">
          <span className="block text-sm font-medium">Review mode</span>
          <div className="grid grid-cols-2 gap-2">
            {REVIEW_MODES.map((m, i) => (
              <label
                key={m.value}
                className="cursor-pointer rounded-md border border-[var(--color-border)] p-2 text-xs has-checked:border-[var(--color-primary)] has-checked:bg-[var(--color-accent)]"
              >
                <input
                  type="radio"
                  name="reviewMode"
                  value={m.value}
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                <div className="font-medium">{m.label}</div>
                <div className="text-[var(--color-muted-foreground)]">{m.hint}</div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium">Tags</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {tagNames.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--color-secondary)] px-2.5 py-0.5 text-xs"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                aria-label={`Remove ${t}`}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(tagInput);
              }
              if (e.key === "Backspace" && !tagInput && tagNames.length > 0) {
                removeTag(tagNames[tagNames.length - 1]);
              }
            }}
            placeholder={tagNames.length === 0 ? "type, press enter" : ""}
            className="min-w-32 flex-1 bg-transparent text-sm outline-none"
          />
          <input type="hidden" name="tagNames" value={JSON.stringify(tagNames)} />
        </div>
        {existingTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {existingTags
              .filter((t) => !tagNames.includes(t.name))
              .slice(0, 12)
              .map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => addTag(t.name)}
                  className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[11px] text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)]"
                >
                  + {t.name}
                </button>
              ))}
          </div>
        )}
      </div>

      <label className="flex items-start gap-2 rounded-md border border-[var(--color-border)] p-3 text-sm">
        <input
          type="checkbox"
          name="aiEnabled"
          className="mt-0.5"
          defaultChecked={false}
        />
        <span>
          <span className="font-medium">
            <Sparkles className="mr-1 inline h-3.5 w-3.5" /> AI assist
          </span>
          <span className="ml-1 text-[var(--color-muted-foreground)]">
            Claude writes a 1-line summary, key concepts, and 3 Q&A on save. Needs an API key in
            Settings.
          </span>
        </span>
      </label>

      {state && !state.ok && (
        <div
          role="alert"
          className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
        >
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--color-muted-foreground)]">
          ⌘/Ctrl + Enter to save
        </span>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Save & schedule
    </button>
  );
}

function KindBadge({ kind, url }: { kind: string; url: string | null }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-[var(--color-muted-foreground)]">
      <span className="rounded bg-[var(--color-secondary)] px-1.5 py-0.5 font-mono uppercase">
        {kind}
      </span>
      {url && <span className="truncate">{new URL(url).hostname}</span>}
    </span>
  );
}
