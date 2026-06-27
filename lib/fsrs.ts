import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  type Card,
  type Grade,
  Rating,
  State,
} from "ts-fsrs";

export type FsrsState = {
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: Date;
};

const PARAMS = generatorParameters({
  enable_fuzz: true,
  enable_short_term: true,
  request_retention: 0.9,
});

const scheduler = fsrs(PARAMS);

/**
 * Build a ts-fsrs Card from our DB Item's persisted FSRS columns.
 * The mapping is intentionally minimal: ts-fsrs uses snake_case fields,
 * our DB uses camelCase. learning_steps is owned by ts-fsrs internals.
 */
export function toCard(item: {
  due: Date;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview: Date | null;
}): Card {
  return {
    due: item.due,
    stability: item.stability,
    difficulty: item.difficulty,
    elapsed_days: item.elapsedDays,
    scheduled_days: item.scheduledDays,
    learning_steps: 0,
    reps: item.reps,
    lapses: item.lapses,
    state: item.state as State,
    last_review: item.lastReview ?? undefined,
  } as Card;
}

export function cardToDb(card: Card): {
  due: Date;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview: Date | null;
} {
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as number,
    lastReview: card.last_review ?? null,
  };
}

/** Create a fresh card. For backdated items, "rewind" `due` to learnedAt so the first
 *  review reflects how long ago the user actually learned it. */
export function newCard(learnedAt: Date = new Date()): Card {
  const card = createEmptyCard(learnedAt);
  card.due = learnedAt;
  return card;
}

/** Apply a review. Returns the next card state and a brief schedule summary. */
export function review(
  card: Card,
  rating: 1 | 2 | 3 | 4,
  now: Date = new Date(),
): { card: Card; nextDue: Date; scheduledDays: number } {
  const result = scheduler.next(card, now, ratingToEnum(rating));
  return {
    card: result.card,
    nextDue: result.card.due,
    scheduledDays: result.card.scheduled_days,
  };
}

/** Preview what each rating would yield without committing. Useful in UI tooltips. */
export function previewAll(card: Card, now: Date = new Date()) {
  const all = scheduler.repeat(card, now);
  return {
    again: all[Rating.Again],
    hard: all[Rating.Hard],
    good: all[Rating.Good],
    easy: all[Rating.Easy],
  };
}

function ratingToEnum(r: 1 | 2 | 3 | 4): Grade {
  switch (r) {
    case 1:
      return Rating.Again as Grade;
    case 2:
      return Rating.Hard as Grade;
    case 3:
      return Rating.Good as Grade;
    case 4:
      return Rating.Easy as Grade;
  }
}

export const STATE_LABELS: Record<number, string> = {
  [State.New]: "New",
  [State.Learning]: "Learning",
  [State.Review]: "Review",
  [State.Relearning]: "Relearning",
};
