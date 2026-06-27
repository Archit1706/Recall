import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-10 px-6 py-16">
      <header className="space-y-3">
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">
          Recall
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Your calm second brain.
        </h1>
        <p className="text-pretty text-lg text-[var(--color-muted-foreground)]">
          Paste anything you learn — a link, a PDF, a snippet, a name. Recall
          schedules the perfect moment to see it again, using the FSRS
          algorithm. Built to fit in the cracks of your day.
        </p>
      </header>

      <ul className="grid gap-4 text-sm sm:grid-cols-2">
        {[
          ["Capture", "URLs, PDFs, markdown, code. <10 seconds, mobile share sheet."],
          ["Review", "Flip, type, or AI-quiz. <30 seconds. Four-button rating."],
          ["Remember", "FSRS schedules reviews at the optimal forgetting curve."],
          ["Free forever", "Self-host on Vercel + Neon. Your data, your keys."],
        ].map(([title, body]) => (
          <li
            key={title}
            className="rounded-xl border border-[var(--color-border)] p-4"
          >
            <div className="mb-1 font-medium">{title}</div>
            <div className="text-[var(--color-muted-foreground)]">{body}</div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/sign-up"
          className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90"
        >
          Get started
        </Link>
        <Link
          href="/sign-in"
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-accent)]"
        >
          Sign in
        </Link>
        <a
          href="https://github.com/Archit1706/recall"
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          GitHub →
        </a>
      </div>
    </main>
  );
}
