import { describe, expect, it } from "vitest";
import { cardToDb, newCard, previewAll, review, toCard } from "./fsrs";

describe("fsrs scheduling", () => {
  it("creates a new card due at learnedAt", () => {
    const learned = new Date("2026-01-01T00:00:00Z");
    const card = newCard(learned);
    expect(card.due.getTime()).toBe(learned.getTime());
    expect(card.reps).toBe(0);
    expect(card.lapses).toBe(0);
  });

  it("pushes the due date forward on Good", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const card = newCard(start);
    const result = review(card, 3, start);
    expect(result.nextDue.getTime()).toBeGreaterThan(start.getTime());
    expect(result.card.reps).toBe(1);
  });

  it("Again schedules sooner than Good", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const card = newCard(start);
    const again = review(card, 1, start);
    const good = review(card, 3, start);
    expect(again.nextDue.getTime()).toBeLessThan(good.nextDue.getTime());
  });

  it("Easy schedules further out than Good", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const card = newCard(start);
    const good = review(card, 3, start);
    const easy = review(card, 4, start);
    expect(easy.nextDue.getTime()).toBeGreaterThanOrEqual(good.nextDue.getTime());
  });

  it("round-trips through db column mapping", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const card = newCard(start);
    const dbRow = cardToDb(card);
    const reconstructed = toCard(dbRow);
    expect(reconstructed.due.getTime()).toBe(card.due.getTime());
    expect(reconstructed.stability).toBe(card.stability);
    expect(reconstructed.difficulty).toBe(card.difficulty);
    expect(reconstructed.state).toBe(card.state);
  });

  it("previewAll returns all four ratings", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const card = newCard(start);
    const previews = previewAll(card, start);
    expect(previews.again).toBeDefined();
    expect(previews.hard).toBeDefined();
    expect(previews.good).toBeDefined();
    expect(previews.easy).toBeDefined();
  });

  it("preserves lapses on Again of a learned card", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    let card = newCard(start);
    card = review(card, 3, start).card;
    card = review(card, 3, new Date(start.getTime() + 86_400_000)).card;
    const beforeLapses = card.lapses;
    const after = review(card, 1, new Date(start.getTime() + 2 * 86_400_000));
    expect(after.card.lapses).toBeGreaterThanOrEqual(beforeLapses);
  });
});
