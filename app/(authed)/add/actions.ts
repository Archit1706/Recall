"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { detectKind, firstUrl } from "@/lib/content";
import { fetchOg } from "@/lib/og";
import { extractPdfText } from "@/lib/pdf";
import { newCard, cardToDb } from "@/lib/fsrs";
import { generateItemEnrichment } from "@/lib/anthropic";

const SaveSchema = z.object({
  title: z.string().trim().min(1).max(300),
  rawContent: z.string().trim().min(1).max(50_000),
  learnedAt: z.string(),
  reviewMode: z.enum(["FLIP", "TYPE", "RECALL_BUTTONS", "AI_QUIZ"]),
  aiEnabled: z.coerce.boolean().optional().default(false),
  tagNames: z.array(z.string().trim().min(1).max(40)).max(20).optional().default([]),
});

export type SaveState = { ok: true; itemId: string } | { ok: false; error: string };

export async function saveItem(_prev: SaveState | null, formData: FormData): Promise<SaveState> {
  const userId = await requireUserId();
  const parsed = SaveSchema.safeParse({
    title: formData.get("title"),
    rawContent: formData.get("rawContent"),
    learnedAt: formData.get("learnedAt"),
    reviewMode: formData.get("reviewMode"),
    aiEnabled: formData.get("aiEnabled") === "on",
    tagNames: JSON.parse((formData.get("tagNames") as string) || "[]"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const learnedAt = new Date(data.learnedAt);
  if (Number.isNaN(learnedAt.getTime())) {
    return { ok: false, error: "Invalid learnedAt date" };
  }

  const kind = detectKind(data.rawContent);
  const sourceUrl = firstUrl(data.rawContent);

  let extractedText: string | null = null;
  if (kind === "LINK" && sourceUrl) {
    const og = await fetchOg(sourceUrl);
    extractedText = [og.title, og.siteName, og.description].filter(Boolean).join("\n");
  } else if (kind === "PDF" && sourceUrl) {
    extractedText = (await extractPdfText(sourceUrl))?.slice(0, 50_000) ?? null;
  }

  const card = newCard(learnedAt);
  const fs = cardToDb(card);

  // Resolve / create tags
  const tagIds: string[] = [];
  for (const raw of data.tagNames) {
    const name = raw.toLowerCase().slice(0, 40);
    if (!name) continue;
    const tag = await prisma.tag.upsert({
      where: { userId_name: { userId, name } },
      create: { userId, name },
      update: {},
      select: { id: true },
    });
    tagIds.push(tag.id);
  }

  const item = await prisma.item.create({
    data: {
      userId,
      title: data.title,
      contentType: kind === "LINK" || kind === "PDF" || kind === "CODE" || kind === "MARKDOWN" ? kind : "TEXT",
      rawContent: data.rawContent,
      extractedText,
      sourceUrl,
      learnedAt,
      reviewMode: data.reviewMode,
      aiEnabled: data.aiEnabled,
      due: fs.due,
      stability: fs.stability,
      difficulty: fs.difficulty,
      elapsedDays: fs.elapsedDays,
      scheduledDays: fs.scheduledDays,
      reps: fs.reps,
      lapses: fs.lapses,
      state: fs.state,
      lastReview: fs.lastReview,
      tags: tagIds.length > 0 ? { connect: tagIds.map((id) => ({ id })) } : undefined,
    },
    select: { id: true },
  });

  if (data.aiEnabled) {
    // Fire-and-forget: never block save on AI. Catch and log only.
    generateItemEnrichment({
      userId,
      itemId: item.id,
      title: data.title,
      content: data.rawContent,
      extractedText,
    }).catch((e) => {
      console.error("[ai] enrichment failed", e);
    });
  }

  revalidatePath("/today");
  revalidatePath("/items");
  redirect(`/items/${item.id}?from=create`);
}
