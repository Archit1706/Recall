/**
 * Elaboration prompts shown every 5th review. Picking one at random feels less
 * mechanical than a single canned line. They're all "connect this to what you know"
 * variations, since elaborative encoding is among the strongest evidence-backed
 * retention boosters.
 */
export const ELABORATION_PROMPTS = [
  "In one sentence, how does this connect to something you already know?",
  "Where could you use this in the next week?",
  "Explain this idea like you're talking to a curious 12-year-old.",
  "What's a real example from your own life?",
  "What was surprising about this when you first learned it?",
  "If this were wrong, what would change downstream?",
] as const;
