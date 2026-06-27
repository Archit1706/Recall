"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Check, Keyboard, SkipForward, X } from "lucide-react";
import { gradeAnswer, recordReview } from "@/app/(authed)/review/actions";
import { ItemContent } from "@/components/items/ItemContent";
import { ELABORATION_PROMPTS } from "@/lib/prompts";

export type ReviewItem = {
  id: string;
  title: string;
  contentType: string;
  rawContent: string;
  sourceUrl: string | null;
  reviewMode: "FLIP" | "TYPE" | "RECALL_BUTTONS" | "AI_QUIZ";
  aiEnabled: boolean;
  aiQuestions: { q: string; a: string }[] | null;
  aiSummary: string | null;
  state: number;
  reps: number;
  tags: string[];
};

const RATINGS: { value: 1 | 2 | 3 | 4; label: string; key: string; tone: string }[] = [
  { value: 1, label: "Again", key: "1", tone: "bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-300" },
  { value: 2, label: "Hard", key: "2", tone: "bg-orange-500/10 border-orange-500/40 text-orange-700 dark:text-orange-300" },
  { value: 3, label: "Good", key: "3", tone: "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300" },
  { value: 4, label: "Easy", key: "4", tone: "bg-sky-500/10 border-sky-500/40 text-sky-700 dark:text-sky-300" },
];

export function ReviewSession({ items, cram }: { items: ReviewItem[]; cram: boolean }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [typed, setTyped] = useState("");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiSuggestedRating, setAiSuggestedRating] = useState<1 | 2 | 3 | 4 | null>(null);
  const [pendingRate, startRate] = useTransition();
  const [pendingAi, startAi] = useTransition();
  const [completed, setCompleted] = useState(0);
  const [showElaboration, setShowElaboration] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const item = items[index];

  const aiQuestion = useMemo(() => {
    if (!item || item.reviewMode !== "AI_QUIZ") return null;
    if (!item.aiQuestions || item.aiQuestions.length === 0) return null;
    return item.aiQuestions[completed % item.aiQuestions.length];
  }, [item, completed]);

  const elaborationPrompt = useMemo(
    () => ELABORATION_PROMPTS[Math.floor(Math.random() * ELABORATION_PROMPTS.length)],
    [showElaboration],
  );

  const reset = useCallback(() => {
    setRevealed(false);
    setTyped("");
    setAiFeedback(null);
    setAiSuggestedRating(null);
    setStartedAt(Date.now());
  }, []);

  const rate = useCallback(
    (rating: 1 | 2 | 3 | 4) => {
      if (!item || pendingRate) return;
      const elapsedMs = Date.now() - startedAt;
      const payload = {
        itemId: item.id,
        rating,
        elapsedMs,
        answer: typed || undefined,
        aiFeedback: aiFeedback ?? undefined,
        cram,
      };
      startRate(async () => {
        await recordReview(payload);
        const nextCompleted = completed + 1;
        setCompleted(nextCompleted);
        if (!cram && nextCompleted % 5 === 0) {
          setShowElaboration(true);
        }
        if (index + 1 >= items.length) {
          router.refresh();
        } else {
          setIndex((i) => i + 1);
          reset();
        }
      });
    },
    [item, pendingRate, startedAt, typed, aiFeedback, cram, completed, index, items.length, reset, router],
  );

  const skip = useCallback(() => {
    if (index + 1 >= items.length) return;
    setIndex((i) => i + 1);
    reset();
  }, [index, items.length, reset]);

  const reveal = useCallback(() => {
    setRevealed(true);
    if (item?.reviewMode === "TYPE") {
      // After reveal in TYPE mode, no auto-grade — user self-rates.
    }
  }, [item]);

  const askAiToGrade = useCallback(() => {
    if (!aiQuestion || !typed.trim() || !item) return;
    startAi(async () => {
      const result = await gradeAnswer({
        itemId: item.id,
        question: aiQuestion.q,
        expected: aiQuestion.a,
        userAnswer: typed,
      });
      if (result) {
        setAiFeedback(result.feedback);
        setAiSuggestedRating(result.rating);
        setRevealed(true);
      } else {
        setAiFeedback("AI grader unavailable — pick a rating yourself.");
        setRevealed(true);
      }
    });
  }, [aiQuestion, typed, item]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (showShortcuts || showElaboration) return;
      const target = e.target as HTMLElement;
      const inField = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (e.key === "?") {
        setShowShortcuts(true);
        return;
      }
      if (inField && e.key !== "Escape") return;

      if (e.key === " " && !revealed) {
        e.preventDefault();
        reveal();
      } else if (revealed && /^[1-4]$/.test(e.key)) {
        rate(Number(e.key) as 1 | 2 | 3 | 4);
      } else if (e.key === "s") {
        skip();
      } else if (e.key === "Escape") {
        router.push("/today");
      } else if (e.key === "e" && item) {
        router.push(`/items/${item.id}`);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, rate, reveal, skip, router, item, showShortcuts, showElaboration]);

  useEffect(() => {
    if ((item?.reviewMode === "TYPE" || item?.reviewMode === "AI_QUIZ") && !revealed) {
      inputRef.current?.focus();
    }
  }, [item, revealed]);

  if (!item) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-semibold">Session complete</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {completed} {completed === 1 ? "review" : "reviews"} logged.
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

  const progressPct = Math.round((completed / items.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
        <span>
          {completed + 1} / {items.length} {cram && "· cram mode"}
        </span>
        <button
          type="button"
          onClick={() => setShowShortcuts(true)}
          aria-label="Keyboard shortcuts"
          className="inline-flex items-center gap-1 hover:text-[var(--color-foreground)]"
        >
          <Keyboard className="h-3.5 w-3.5" /> ?
        </button>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-secondary)]">
        <div
          className="h-full bg-[var(--color-primary)] transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <article className="space-y-4 rounded-2xl border border-[var(--color-border)] p-5">
        <header className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
            <span className="rounded bg-[var(--color-secondary)] px-1.5 py-0.5 font-mono uppercase">
              {item.contentType}
            </span>
            {item.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
          <h1 className="text-xl font-semibold tracking-tight">{item.title}</h1>
        </header>

        {item.reviewMode === "FLIP" && (
          <FlipMode item={item} revealed={revealed} onReveal={reveal} />
        )}
        {item.reviewMode === "RECALL_BUTTONS" && (
          <RecallMode item={item} revealed={revealed} onReveal={reveal} />
        )}
        {item.reviewMode === "TYPE" && (
          <TypeMode
            item={item}
            revealed={revealed}
            typed={typed}
            onType={setTyped}
            onReveal={reveal}
            inputRef={inputRef}
          />
        )}
        {item.reviewMode === "AI_QUIZ" && (
          <AiQuizMode
            item={item}
            question={aiQuestion}
            typed={typed}
            onType={setTyped}
            revealed={revealed}
            aiFeedback={aiFeedback}
            onGrade={askAiToGrade}
            grading={pendingAi}
            inputRef={inputRef}
          />
        )}
      </article>

      {revealed ? (
        <div className="space-y-3">
          {aiSuggestedRating && (
            <p className="text-center text-xs text-[var(--color-muted-foreground)]">
              Claude suggests <strong>{RATINGS[aiSuggestedRating - 1].label}</strong> · override below
            </p>
          )}
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                type="button"
                disabled={pendingRate}
                onClick={() => rate(r.value)}
                className={`rounded-xl border px-2 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 ${r.tone}`}
              >
                <div>{r.label}</div>
                <div className="mt-0.5 text-[10px] opacity-60">{r.key}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={skip}
            className="inline-flex items-center gap-1 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          >
            <SkipForward className="h-3.5 w-3.5" /> Skip (s)
          </button>
          {(item.reviewMode === "FLIP" || item.reviewMode === "RECALL_BUTTONS") && (
            <button
              type="button"
              onClick={reveal}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--color-accent)]"
            >
              Show (space)
            </button>
          )}
          {item.reviewMode === "TYPE" && (
            <button
              type="button"
              onClick={reveal}
              className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--color-accent)]"
            >
              Check
            </button>
          )}
        </div>
      )}

      {showShortcuts && (
        <Modal onClose={() => setShowShortcuts(false)} title="Keyboard">
          <ul className="space-y-1 text-sm">
            <li><Kbd>Space</Kbd> reveal</li>
            <li><Kbd>1</Kbd>–<Kbd>4</Kbd> rate Again/Hard/Good/Easy</li>
            <li><Kbd>s</Kbd> skip</li>
            <li><Kbd>e</Kbd> edit this item</li>
            <li><Kbd>Esc</Kbd> exit session</li>
            <li><Kbd>?</Kbd> this menu</li>
          </ul>
        </Modal>
      )}
      {showElaboration && (
        <Modal onClose={() => setShowElaboration(false)} title="Quick elaboration">
          <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
            {elaborationPrompt}
          </p>
          <button
            type="button"
            onClick={() => setShowElaboration(false)}
            className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary-foreground)]"
          >
            Continue
          </button>
        </Modal>
      )}
    </div>
  );
}

function FlipMode({
  item,
  revealed,
  onReveal,
}: {
  item: ReviewItem;
  revealed: boolean;
  onReveal: () => void;
}) {
  if (!revealed) {
    return (
      <button
        type="button"
        onClick={onReveal}
        className="block w-full rounded-xl border border-dashed border-[var(--color-border)] py-12 text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)]"
      >
        Click or press space to flip
      </button>
    );
  }
  return <ItemContent contentType={item.contentType} rawContent={item.rawContent} sourceUrl={item.sourceUrl} />;
}

function RecallMode({
  item,
  revealed,
  onReveal,
}: {
  item: ReviewItem;
  revealed: boolean;
  onReveal: () => void;
}) {
  if (!revealed) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Recall it in your head — then check.
        </p>
        <button
          type="button"
          onClick={onReveal}
          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--color-accent)]"
        >
          Show answer
        </button>
      </div>
    );
  }
  return <ItemContent contentType={item.contentType} rawContent={item.rawContent} sourceUrl={item.sourceUrl} />;
}

function TypeMode({
  item,
  revealed,
  typed,
  onType,
  onReveal,
  inputRef,
}: {
  item: ReviewItem;
  revealed: boolean;
  typed: string;
  onType: (v: string) => void;
  onReveal: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  if (!revealed) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Type what you remember.
        </p>
        <textarea
          ref={inputRef}
          value={typed}
          onChange={(e) => onType(e.target.value)}
          rows={5}
          className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
        />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 text-xs font-medium text-[var(--color-muted-foreground)]">
          You typed
        </div>
        <pre className="rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)]/40 p-3 text-sm whitespace-pre-wrap">
          {typed || <em className="text-[var(--color-muted-foreground)]">(blank)</em>}
        </pre>
      </div>
      <div>
        <div className="mb-1 text-xs font-medium text-[var(--color-muted-foreground)]">
          Answer
        </div>
        <ItemContent contentType={item.contentType} rawContent={item.rawContent} sourceUrl={item.sourceUrl} />
      </div>
    </div>
  );
}

function AiQuizMode({
  item,
  question,
  typed,
  onType,
  revealed,
  aiFeedback,
  onGrade,
  grading,
  inputRef,
}: {
  item: ReviewItem;
  question: { q: string; a: string } | null;
  typed: string;
  onType: (v: string) => void;
  revealed: boolean;
  aiFeedback: string | null;
  onGrade: () => void;
  grading: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  if (!question) {
    return (
      <div className="rounded-md border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-muted-foreground)]">
        No AI questions cached yet. {item.aiEnabled ? "Try again in a moment." : "Enable AI on this item and re-save."}
        <div className="mt-2">
          <ItemContent contentType={item.contentType} rawContent={item.rawContent} sourceUrl={item.sourceUrl} />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 text-xs font-medium text-[var(--color-muted-foreground)]">
          Question
        </div>
        <p className="text-base">{question.q}</p>
      </div>
      {!revealed ? (
        <>
          <textarea
            ref={inputRef}
            value={typed}
            onChange={(e) => onType(e.target.value)}
            rows={4}
            placeholder="Your answer…"
            className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          />
          <button
            type="button"
            onClick={onGrade}
            disabled={!typed.trim() || grading}
            className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary-foreground)] disabled:opacity-50"
          >
            {grading ? "Grading…" : "Have Claude grade it"}
          </button>
        </>
      ) : (
        <>
          {aiFeedback && (
            <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-secondary)]/40 p-3 text-sm">
              <div className="mb-1 text-xs font-medium text-[var(--color-muted-foreground)]">
                Claude
              </div>
              {aiFeedback}
            </div>
          )}
          <div>
            <div className="mb-1 text-xs font-medium text-[var(--color-muted-foreground)]">
              Expected answer
            </div>
            <p className="rounded-md border border-[var(--color-border)] p-3 text-sm">
              {question.a}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-secondary)] px-1.5 py-0.5 font-mono text-[11px]">
      {children}
    </kbd>
  );
}

function Modal({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Marker to ensure Check icon import isn't tree-shaken (unused vars).
export const _CheckRef = Check;
