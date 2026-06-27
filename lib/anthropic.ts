import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./prisma";
import { decryptSecret } from "./encryption";

const DEFAULT_MODEL = process.env.ANTHROPIC_DEFAULT_MODEL || "claude-haiku-4-5-20251001";

async function clientFor(userId: string): Promise<{ client: Anthropic; model: string } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { anthropicKey: true, anthropicModel: true },
  });
  if (!user?.anthropicKey) return null;
  let apiKey: string;
  try {
    apiKey = decryptSecret(user.anthropicKey);
  } catch {
    return null;
  }
  return { client: new Anthropic({ apiKey }), model: user.anthropicModel || DEFAULT_MODEL };
}

type EnrichmentParams = {
  userId: string;
  itemId: string;
  title: string;
  content: string;
  extractedText: string | null;
};

type EnrichmentJson = {
  summary: string;
  concepts: string[];
  questions: { q: string; a: string }[];
};

/**
 * Calls Claude once to summarize, list key concepts, and produce 3 flashcard Q&A.
 * Caches result on the Item row. Failure is non-fatal — the item still exists.
 */
export async function generateItemEnrichment(p: EnrichmentParams): Promise<void> {
  const ctx = await clientFor(p.userId);
  if (!ctx) return;

  const sourceMaterial = [p.title, p.content, p.extractedText ?? ""]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 20_000);

  const prompt = `You are helping a user remember something they just learned.

TITLE: ${p.title}

CONTENT:
${sourceMaterial}

Produce a JSON object with these keys, and nothing else:
- "summary": one or two sentences that capture the essence
- "concepts": array of 3-5 short key-concept strings
- "questions": array of exactly 3 flashcard Q&A objects, each {"q": "...", "a": "..."}. Questions should test understanding, not trivia.

Reply with ONLY raw JSON, no markdown fence.`;

  const resp = await ctx.client.messages.create({
    model: ctx.model,
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");

  let parsed: EnrichmentJson | null = null;
  try {
    const stripped = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    parsed = JSON.parse(stripped) as EnrichmentJson;
  } catch {
    return;
  }
  if (!parsed?.summary || !Array.isArray(parsed.questions)) return;

  await prisma.item.update({
    where: { id: p.itemId },
    data: {
      aiSummary: parsed.summary,
      aiConcepts: parsed.concepts ?? [],
      aiQuestions: parsed.questions,
    },
  });
}

type GradeParams = {
  userId: string;
  question: string;
  expected: string;
  userAnswer: string;
};

export async function gradeAiAnswer(
  p: GradeParams,
): Promise<{ rating: 1 | 2 | 3 | 4; feedback: string } | null> {
  const ctx = await clientFor(p.userId);
  if (!ctx) return null;

  const resp = await ctx.client.messages.create({
    model: ctx.model,
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `Grade a flashcard answer on the FSRS scale.

QUESTION: ${p.question}
EXPECTED ANSWER: ${p.expected}
USER ANSWER: ${p.userAnswer}

Reply with ONLY raw JSON: {"rating": 1|2|3|4, "feedback": "one short sentence"}.
Rating scale: 1=Again (wrong), 2=Hard (partial), 3=Good (correct), 4=Easy (correct + concise).`,
      },
    ],
  });

  const text = resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("")
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    const j = JSON.parse(text) as { rating: number; feedback: string };
    const rating = Math.max(1, Math.min(4, Math.round(j.rating))) as 1 | 2 | 3 | 4;
    return { rating, feedback: String(j.feedback ?? "") };
  } catch {
    return null;
  }
}
