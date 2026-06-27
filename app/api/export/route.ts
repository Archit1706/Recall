import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";

export const runtime = "nodejs";

type ExportItem = {
  title: string;
  contentType: string;
  rawContent: string;
  extractedText: string | null;
  sourceUrl: string | null;
  learnedAt: Date;
  reviewMode: string;
  tags: { name: string }[];
  notes: string | null;
  aiSummary: string | null;
  due: Date;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview: Date | null;
};

export async function GET(req: Request) {
  const userId = await requireUserId();
  const url = new URL(req.url);
  const format = url.searchParams.get("format") ?? "json";

  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { tags: { select: { name: true } } },
  });

  if (format === "anki") {
    // Anki .apkg format requires SQLite — we can't ship that in a serverless
    // function without bundling. Instead, emit a tab-separated text file that
    // Anki Desktop imports natively (File → Import → Text). One row per card.
    const tsv = ["Front\tBack\tTags"]
      .concat(
        items.map((it: { title: string; rawContent: string; tags: { name: string }[] }) => {
          const front = sanitize(it.title);
          const back = sanitize(it.rawContent.slice(0, 1500));
          const tags = it.tags.map((t: { name: string }) => t.name).join(" ");
          return `${front}\t${back}\t${tags}`;
        }),
      )
      .join("\n");
    return new Response(tsv, {
      headers: {
        "content-type": "text/tab-separated-values; charset=utf-8",
        "content-disposition": `attachment; filename="recall-anki.tsv"`,
      },
    });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    items: (items as ExportItem[]).map((it) => ({
      title: it.title,
      contentType: it.contentType,
      rawContent: it.rawContent,
      extractedText: it.extractedText,
      sourceUrl: it.sourceUrl,
      learnedAt: it.learnedAt,
      reviewMode: it.reviewMode,
      tags: it.tags.map((t: { name: string }) => t.name),
      notes: it.notes,
      aiSummary: it.aiSummary,
      fsrs: {
        due: it.due,
        stability: it.stability,
        difficulty: it.difficulty,
        elapsedDays: it.elapsedDays,
        scheduledDays: it.scheduledDays,
        reps: it.reps,
        lapses: it.lapses,
        state: it.state,
        lastReview: it.lastReview,
      },
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="recall-export.json"`,
    },
  });
}

function sanitize(s: string): string {
  return s.replace(/\t/g, "    ").replace(/\r?\n/g, "<br>");
}
