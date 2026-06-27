import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://recall-forever.vercel.app";

export const metadata: Metadata = {
  title: "Recall — Free Spaced Repetition App with FSRS & AI Flashcards",
  description:
    "Recall is a free, self-hostable spaced repetition app. Save links, PDFs, notes, and code, then let the FSRS algorithm schedule the perfect review. AI-generated flashcards, PWA, dark mode, web push. The friction-free Anki alternative.",
  alternates: { canonical: "/" },
};

const FEATURES = [
  {
    title: "Capture anything in 10 seconds",
    body: "Paste a link, PDF URL, markdown note, or code snippet. Recall auto-detects the type, fetches an OpenGraph preview for links, extracts text from PDFs, and turns it into a reviewable card. PWA share target so anything on your phone is one tap away.",
    kw: "save links to remember, PDF flashcards, markdown notes, code snippet memorization",
  },
  {
    title: "Reviews scheduled by FSRS",
    body: "The Free Spaced Repetition Scheduler is the modern algorithm that outperforms SuperMemo's SM-2. Recall persists your individual forgetting curve, so the next review lands exactly when you'd otherwise forget.",
    kw: "FSRS algorithm, spaced repetition scheduler, optimal review timing, forgetting curve, Ebbinghaus",
  },
  {
    title: "Four review modes",
    body: "Flip, type, recall + reveal, or AI quiz. Keyboard-first: space to reveal, 1–4 to rate Again / Hard / Good / Easy. Interleave-by-tag boosts retention versus blocked practice.",
    kw: "active recall, flashcards app, free flashcards, study app, interleaving practice",
  },
  {
    title: "Optional AI assist",
    body: "Bring your own Anthropic Claude API key. On save, Recall generates a one-line summary, 3-5 key concepts, and 3 flashcard Q&A. During review, AI quiz grades your typed answers and suggests a rating.",
    kw: "AI flashcards, Claude flashcards, AI quiz generator, automatic flashcard creation",
  },
  {
    title: "Stay reminded, never spammed",
    body: "Daily 8am email digest via Resend and quiet web push (VAPID) — only when something is due. One-tap unsubscribe. GitHub-style heatmap, streak counter, 30-day load forecast.",
    kw: "spaced repetition reminders, daily review digest, learning streak, study habit tracker",
  },
  {
    title: "Self-host, free forever",
    body: "Runs on Vercel Hobby + Neon Postgres + Clerk + Resend. Every service is free at the tier we use. Your data, your keys, exportable to JSON and Anki. MIT licensed.",
    kw: "self-hosted Anki alternative, free Anki alternative, open source flashcards, Next.js learning app",
  },
] as const;

const FAQ = [
  {
    q: "What is spaced repetition?",
    a: "Spaced repetition is a learning technique that schedules each review at the moment you're about to forget the material. Done right, it converts short-term recognition into permanent recall with the minimum number of repetitions. Recall implements spaced repetition using FSRS, the most accurate open scheduler available today.",
  },
  {
    q: "How is Recall different from Anki?",
    a: "Anki is excellent but has friction: you have to format each card front/back, the desktop UI is dated, and modern sync requires a paid AnkiWeb account or self-hosting. Recall accepts any input (link, PDF, markdown, code) without forcing a card format, ships a clean PWA, uses FSRS instead of SM-2, optionally generates flashcards with Claude AI, and is fully self-hostable on free tiers.",
  },
  {
    q: "Is Recall free?",
    a: "Yes. Recall is open source (MIT) and the hosted reference deployment is free. All third-party services we depend on (Vercel Hobby, Neon Postgres, Clerk, Resend) have generous free tiers that Recall stays within by design.",
  },
  {
    q: "What is FSRS?",
    a: "FSRS (Free Spaced Repetition Scheduler) is a modern, open-source spaced repetition algorithm. It models your individual memory stability and difficulty per card and computes the next review interval that maximizes long-term retention while minimizing review time. It outperforms SuperMemo's SM-2 — the algorithm that classic Anki uses by default — in benchmarks.",
  },
  {
    q: "Can I import from Anki?",
    a: "Recall exports to a tab-separated format Anki Desktop imports natively (File → Import → Text). Anki → Recall import is on the roadmap. In the meantime, paste a list of URLs or notes in the Settings → Import box to bulk-add.",
  },
  {
    q: "Do I need an API key for AI features?",
    a: "Only if you want AI summaries, AI-generated flashcards, or AI quiz grading. Provide your own Anthropic Claude key in Settings — it's encrypted with AES-256-GCM at rest and used only when you enable AI on an individual item. The rest of the app works perfectly without it.",
  },
  {
    q: "Does Recall work offline?",
    a: "The review queue is cached by a service worker, so once today's session is loaded you can keep reviewing on a flight or subway. Capture and stats require network.",
  },
  {
    q: "Is my data private?",
    a: "Yes. All your items live in your own Postgres database. The app is open source so you can audit exactly what runs. Your Anthropic API key is encrypted at rest. If you want full ownership, self-host — the README has a 7-step Vercel deploy walkthrough.",
  },
] as const;

const APP_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Recall",
  alternateName: ["Recall App", "Recall by Archit"],
  applicationCategory: "EducationalApplication",
  applicationSubCategory: "Spaced Repetition Flashcards",
  operatingSystem: "Web, iOS, Android",
  url: SITE_URL,
  description:
    "Free, self-hostable spaced repetition learning app. Paste anything you learn — text, links, PDFs, markdown, code — and Recall schedules optimal reviews with the FSRS algorithm.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "FSRS spaced repetition algorithm",
    "AI-generated flashcards via Anthropic Claude",
    "PDF text extraction",
    "OpenGraph link previews",
    "Four review modes: Flip, Type, Recall, AI Quiz",
    "PWA share target",
    "Offline review queue",
    "Daily email digest + web push reminders",
    "Tags, full-text search, stats heatmap",
    "JSON and Anki export",
    "Self-hostable on free tiers",
    "Open source MIT licensed",
  ],
  author: {
    "@type": "Person",
    name: "Archit Rathod",
    url: "https://github.com/Archit1706",
  },
  publisher: {
    "@type": "Person",
    name: "Archit Rathod",
    url: "https://github.com/Archit1706",
  },
  aggregateRating: undefined,
  inLanguage: "en",
  isAccessibleForFree: true,
  keywords:
    "spaced repetition, FSRS, free Anki alternative, AI flashcards, second brain, PKM, self-hostable, learning app",
};

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const ORG_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Recall",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/items?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_LD) }}
      />

      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <nav
          aria-label="Primary"
          className="mb-12 flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2 font-semibold">
            <span
              aria-hidden
              className="grid h-7 w-7 place-items-center rounded-md bg-[var(--color-primary)] font-bold text-[var(--color-primary-foreground)]"
            >
              R
            </span>
            Recall
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="rounded-md px-3 py-1.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 font-medium text-[var(--color-primary-foreground)]"
            >
              Get started
            </Link>
          </div>
        </nav>

        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-secondary)]/40 px-3 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Free forever · Self-hostable · Open source
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            The free spaced repetition app that remembers <em>everything</em> you learn.
          </h1>
          <p className="max-w-2xl text-pretty text-lg text-[var(--color-muted-foreground)]">
            Recall is your calm second brain. Paste a link, PDF, markdown note,
            or code snippet — the <strong>FSRS algorithm</strong> schedules the
            perfect moment to see it again. Optional AI generates flashcards
            and grades your answers. Capture in under 10 seconds, review in
            under 30. The friction-free Anki alternative.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/sign-up"
              className="rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90"
            >
              Start remembering →
            </Link>
            <Link
              href="/sign-in"
              className="rounded-md border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--color-accent)]"
            >
              Sign in
            </Link>
            <a
              href="https://github.com/Archit1706/Recall"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              Source on GitHub →
            </a>
          </div>
        </header>

        <figure className="my-12 overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <Image
            src="/hero.svg"
            alt="Diagram of the Ebbinghaus forgetting curve. Without review, recall decays exponentially. With Recall's FSRS-scheduled reviews, the curve stays high — five reinforcement points keep retention near 100% across 30 days."
            width={1440}
            height={960}
            priority
            className="h-auto w-full"
          />
          <figcaption className="sr-only">
            The Ebbinghaus forgetting curve flattened by spaced reviews.
          </figcaption>
        </figure>

        <section
          aria-labelledby="features"
          className="grid gap-4 sm:grid-cols-2"
        >
          <h2 id="features" className="sr-only">
            Features
          </h2>
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="rounded-xl border border-[var(--color-border)] p-5"
            >
              <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {f.body}
              </p>
              <p className="sr-only">Keywords: {f.kw}</p>
            </article>
          ))}
        </section>

        <section aria-labelledby="how" className="my-16 space-y-4">
          <h2 id="how" className="text-2xl font-semibold tracking-tight">
            How spaced repetition with FSRS works
          </h2>
          <p className="text-[var(--color-muted-foreground)]">
            Hermann Ebbinghaus showed in 1885 that we forget about 50% of new
            information within an hour and ~80% within a week — unless we
            actively review it. Spaced repetition flips this: by scheduling
            reviews right before you would forget, every repetition costs less
            and lasts longer. <strong>FSRS</strong> (Free Spaced Repetition
            Scheduler) is the modern open algorithm that models your individual
            memory stability and difficulty per card and computes the next
            review interval that maximizes retention while minimizing time
            spent. Recall is built on the <code>ts-fsrs</code> reference
            implementation.
          </p>
          <ol className="grid gap-3 text-sm sm:grid-cols-3">
            <li className="rounded-xl border border-[var(--color-border)] p-4">
              <div className="mb-1 font-mono text-xs text-[var(--color-muted-foreground)]">
                1
              </div>
              <strong>Capture.</strong> Paste a URL, PDF link, markdown, or
              code. Recall auto-detects type and fetches a preview.
            </li>
            <li className="rounded-xl border border-[var(--color-border)] p-4">
              <div className="mb-1 font-mono text-xs text-[var(--color-muted-foreground)]">
                2
              </div>
              <strong>Review.</strong> FSRS picks the next due date. You rate
              Again / Hard / Good / Easy. The algorithm learns your curve.
            </li>
            <li className="rounded-xl border border-[var(--color-border)] p-4">
              <div className="mb-1 font-mono text-xs text-[var(--color-muted-foreground)]">
                3
              </div>
              <strong>Retain.</strong> Reviews stretch from days to weeks to
              months as stability grows. You keep what you learned, forever.
            </li>
          </ol>
        </section>

        <section aria-labelledby="faq" className="my-16 space-y-3">
          <h2 id="faq" className="text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="rounded-xl border border-[var(--color-border)] open:bg-[var(--color-secondary)]/30"
              >
                <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
                  {f.q}
                </summary>
                <p className="px-4 pb-4 text-sm text-[var(--color-muted-foreground)]">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="who" className="my-16 space-y-3">
          <h2 id="who" className="text-2xl font-semibold tracking-tight">
            Who Recall is for
          </h2>
          <ul className="grid gap-2 text-sm text-[var(--color-muted-foreground)] sm:grid-cols-2">
            <li>📚 Students preparing for exams (USMLE, bar, GRE, finals)</li>
            <li>👩‍💻 Engineers learning new languages, frameworks, syscalls</li>
            <li>🧠 Knowledge workers who read 100+ articles a month</li>
            <li>🌍 Language learners (vocab + grammar)</li>
            <li>🎓 PhD researchers tracking concepts across papers</li>
            <li>🧑‍⚕️ Medical residents, paralegals, anyone with high-stakes recall</li>
            <li>📝 Note-takers escaping Notion/Obsidian-as-graveyard</li>
            <li>🔓 Anki refugees who want zero friction and free hosting</li>
          </ul>
        </section>

        <footer className="mt-20 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-muted-foreground)]">
          <div>
            Recall · Free spaced repetition · FSRS · AI flashcards · Open source
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Archit1706/Recall"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--color-foreground)]"
            >
              GitHub
            </a>
            <a href="/llms.txt" className="hover:text-[var(--color-foreground)]">
              llms.txt
            </a>
            <a href="/sitemap.xml" className="hover:text-[var(--color-foreground)]">
              sitemap
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
