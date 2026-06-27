/**
 * Lightweight content-type detection for the capture textarea. Run on both the
 * client (for live UI hints) and server (authoritative classification at save).
 */
export type DetectedKind = "TEXT" | "LINK" | "PDF" | "MARKDOWN" | "CODE";

const URL_RE = /^https?:\/\/\S+$/i;
const CODE_FENCE_RE = /```[\s\S]*?```/;
const INLINE_CODE_HEAVY = /(^|\n)\s*(function |const |class |def |import |#include|<\w+|<\/\w+>|public |private )/m;
const MARKDOWN_SIGNALS = /(^|\n)(#{1,6} |- |\* |\d+\. |> |\|.+\|)/m;

export function detectKind(input: string): DetectedKind {
  const text = input.trim();
  if (!text) return "TEXT";

  // A single URL on its own line → link / pdf
  if (URL_RE.test(text) && !text.includes("\n")) {
    return /\.pdf(\?|#|$)/i.test(text) ? "PDF" : "LINK";
  }

  if (CODE_FENCE_RE.test(text)) return "CODE";

  if (MARKDOWN_SIGNALS.test(text)) return "MARKDOWN";

  if (INLINE_CODE_HEAVY.test(text)) return "CODE";

  return "TEXT";
}

export function firstUrl(input: string): string | null {
  const m = input.match(/https?:\/\/[^\s)]+/i);
  return m ? m[0] : null;
}

/** Strip noisy markdown to a plain-text snippet for previews / search. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .trim();
}
