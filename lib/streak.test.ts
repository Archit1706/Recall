import { describe, expect, it } from "vitest";
import { computeStreak } from "./streak";

function d(iso: string): Date {
  return new Date(iso);
}

describe("computeStreak", () => {
  it("returns 0 with no reviews", () => {
    expect(computeStreak([])).toEqual({ current: 0, longest: 0 });
  });

  it("counts a single-day streak", () => {
    const now = d("2026-06-15T12:00:00Z");
    expect(computeStreak([d("2026-06-15T10:00:00Z")], undefined, now)).toEqual({
      current: 1,
      longest: 1,
    });
  });

  it("counts a multi-day streak ending today", () => {
    const now = d("2026-06-15T12:00:00Z");
    const reviews = [
      d("2026-06-13T10:00:00Z"),
      d("2026-06-14T10:00:00Z"),
      d("2026-06-15T10:00:00Z"),
    ];
    expect(computeStreak(reviews, undefined, now).current).toBe(3);
  });

  it("includes yesterday-grace if today has no review yet", () => {
    const now = d("2026-06-15T05:00:00Z");
    const reviews = [d("2026-06-13T10:00:00Z"), d("2026-06-14T10:00:00Z")];
    expect(computeStreak(reviews, undefined, now).current).toBe(2);
  });

  it("resets if there's a gap", () => {
    const now = d("2026-06-15T12:00:00Z");
    const reviews = [d("2026-06-10T10:00:00Z"), d("2026-06-15T10:00:00Z")];
    const result = computeStreak(reviews, undefined, now);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(1);
  });

  it("longest run tracks the best historical streak", () => {
    const now = d("2026-06-20T12:00:00Z");
    const reviews = [
      d("2026-06-01"),
      d("2026-06-02"),
      d("2026-06-03"),
      d("2026-06-04"),
      d("2026-06-20"),
    ];
    expect(computeStreak(reviews, undefined, now).longest).toBe(4);
  });
});
