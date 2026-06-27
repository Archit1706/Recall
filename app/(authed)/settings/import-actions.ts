"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { newCard, cardToDb } from "@/lib/fsrs";
import { detectKind, firstUrl } from "@/lib/content";

const MAX = 100;

export async function bulkImport(raw: string): Promise<{ created: number; total: number }> {
  const userId = await requireUserId();
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, MAX);

  if (lines.length === 0) return { created: 0, total: 0 };

  const now = new Date();
  const card = newCard(now);
  const fs = cardToDb(card);

  let created = 0;
  for (const line of lines) {
    const kind = detectKind(line);
    const url = firstUrl(line);
    const title = kind === "LINK" || kind === "PDF" ? (url ?? line).slice(0, 200) : line.slice(0, 200);
    try {
      await prisma.item.create({
        data: {
          userId,
          title,
          contentType: kind === "LINK" || kind === "PDF" || kind === "CODE" || kind === "MARKDOWN" ? kind : "TEXT",
          rawContent: line,
          sourceUrl: url,
          learnedAt: now,
          reviewMode: "RECALL_BUTTONS",
          due: fs.due,
          stability: fs.stability,
          difficulty: fs.difficulty,
          elapsedDays: fs.elapsedDays,
          scheduledDays: fs.scheduledDays,
          reps: fs.reps,
          lapses: fs.lapses,
          state: fs.state,
          lastReview: fs.lastReview,
        },
      });
      created += 1;
    } catch (e) {
      console.error("[import] failed", e);
    }
  }

  revalidatePath("/items");
  revalidatePath("/today");
  return { created, total: lines.length };
}
