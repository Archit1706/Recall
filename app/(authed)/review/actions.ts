"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { cardToDb, review, toCard } from "@/lib/fsrs";
import { gradeAiAnswer } from "@/lib/anthropic";

const RecordSchema = z.object({
  itemId: z.string().min(1),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  elapsedMs: z.number().int().nonnegative().optional(),
  answer: z.string().max(5000).optional(),
  aiFeedback: z.string().max(2000).optional(),
  cram: z.boolean().optional(),
});

export async function recordReview(input: z.infer<typeof RecordSchema>): Promise<
  | { ok: true; nextDueDays: number }
  | { ok: false; error: string }
> {
  const userId = await requireUserId();
  const parsed = RecordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const { itemId, rating, elapsedMs, answer, aiFeedback, cram } = parsed.data;

  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: {
      id: true,
      due: true,
      stability: true,
      difficulty: true,
      elapsedDays: true,
      scheduledDays: true,
      reps: true,
      lapses: true,
      state: true,
      lastReview: true,
    },
  });
  if (!item) return { ok: false, error: "Not found" };

  // Cram mode: log the review but don't update FSRS state.
  if (cram) {
    await prisma.review.create({
      data: { userId, itemId, rating, elapsedMs, answer, aiFeedback },
    });
    return { ok: true, nextDueDays: 0 };
  }

  const now = new Date();
  const card = toCard(item);
  const next = review(card, rating, now);
  const dbFields = cardToDb(next.card);

  await prisma.$transaction([
    prisma.item.update({
      where: { id: itemId },
      data: { ...dbFields },
    }),
    prisma.review.create({
      data: { userId, itemId, rating, elapsedMs, answer, aiFeedback },
    }),
  ]);

  revalidatePath("/today");
  revalidatePath(`/items/${itemId}`);
  return { ok: true, nextDueDays: next.scheduledDays };
}

export async function gradeAnswer(input: {
  userId?: string;
  itemId: string;
  question: string;
  expected: string;
  userAnswer: string;
}): Promise<{ rating: 1 | 2 | 3 | 4; feedback: string } | null> {
  const userId = await requireUserId();
  return gradeAiAnswer({
    userId,
    question: input.question,
    expected: input.expected,
    userAnswer: input.userAnswer,
  });
}
