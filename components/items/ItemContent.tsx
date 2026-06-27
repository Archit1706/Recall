import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

type Props = {
  contentType: string;
  rawContent: string;
  sourceUrl: string | null;
};

export function ItemContent({ contentType, rawContent, sourceUrl }: Props) {
  if (contentType === "LINK") {
    return (
      <div className="rounded-xl border border-[var(--color-border)] p-4 text-sm">
        <div className="mb-1 text-xs text-[var(--color-muted-foreground)]">Saved link</div>
        <Link
          href={sourceUrl ?? rawContent}
          target="_blank"
          rel="noreferrer"
          className="text-base font-medium underline-offset-2 hover:underline"
        >
          {sourceUrl ?? rawContent}
        </Link>
      </div>
    );
  }
  if (contentType === "PDF") {
    return (
      <div className="rounded-xl border border-[var(--color-border)] p-4 text-sm">
        <div className="mb-1 text-xs text-[var(--color-muted-foreground)]">PDF</div>
        <Link
          href={sourceUrl ?? rawContent}
          target="_blank"
          rel="noreferrer"
          className="text-base font-medium underline-offset-2 hover:underline"
        >
          {sourceUrl ?? rawContent}
        </Link>
      </div>
    );
  }
  if (contentType === "CODE") {
    return (
      <pre className="overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-secondary)]/30 p-4 text-sm">
        <code>{rawContent}</code>
      </pre>
    );
  }
  if (contentType === "MARKDOWN") {
    return (
      <article className="prose prose-sm dark:prose-invert max-w-none [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-[var(--color-border)]">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {rawContent}
        </ReactMarkdown>
      </article>
    );
  }
  return (
    <div className="rounded-xl border border-[var(--color-border)] p-4 text-sm whitespace-pre-wrap">
      {rawContent}
    </div>
  );
}
