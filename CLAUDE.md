# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Next.js dev server (Turbopack) on http://localhost:3000
npm run build        # prisma generate && next build — always run prisma generate first
npm run start        # production server (after build)
npm run lint         # next lint
npm run typecheck    # tsc --noEmit, strict mode
npm test             # vitest run (one-shot)
npm run test:watch   # vitest in watch mode
npm run db:push      # apply schema.prisma to the database (no migration history)
npm run db:migrate   # create + apply a new dev migration
npm run db:studio    # browse the DB
npm run vapid:generate  # mint VAPID keypair for web push

# Run a single test file
npx vitest run lib/fsrs.test.ts
# Run a single test by name
npx vitest run -t "Again schedules sooner than Good"

# Regenerate PWA icons (pure-Node, no canvas/sharp dep)
node scripts/make-icons.mjs
```

### Build gotcha — Prisma 7

The `@prisma/client` package re-exports from `.prisma/client/default`, which only exists after `prisma generate` runs. The `postinstall` script (`prisma generate || true`) handles this on every `npm install` (the `|| true` is intentional — `prisma generate` doesn't need DATABASE_URL but other failures shouldn't block install). The `build` script runs it again as belt-and-suspenders. If you ever see "Module '@prisma/client' has no exported member 'PrismaClient'" in CI, the install step skipped `prisma generate`.

### Local Prisma engine downloads

In some sandboxed environments the Prisma postinstall can't fetch the engine binary. That's fine for type generation — Prisma 7 uses driver adapters (`@prisma/adapter-neon` + `@neondatabase/serverless`) and doesn't need the Rust query engine at runtime. If `prisma generate` fails locally on binary download, try `CHECKPOINT_DISABLE=1 NODE_EXTRA_CA_CERTS=/path/to/ca-bundle.crt npx prisma generate`.

## Architecture

### Stack

Next.js 16 (App Router, Turbopack) + TypeScript strict · Tailwind v4 (CSS-first config in `app/globals.css`, no `tailwind.config.*`) · Prisma 7 with **Neon driver adapter** (no native engine binary at runtime) · Clerk auth · `ts-fsrs` for spaced repetition · Resend email · `web-push` (VAPID) · `unpdf` for PDF extraction · Anthropic Claude SDK (user-supplied key, per-item opt-in).

### Prisma 7 quirks worth knowing

- **Datasource URLs live in `prisma.config.ts`, not `schema.prisma`.** Setting `url`/`directUrl` in the datasource block fails validation in Prisma 7.
- **`lib/prisma.ts` always constructs `new PrismaClient({ adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }) })`.** Don't import `PrismaClient` without the adapter — there's no fallback engine.
- The generator output is pinned to `node_modules/.prisma/client` so the `@prisma/client` re-export shim resolves consistently in local + CI.

### App Router layout

- `app/page.tsx` — public landing (rich JSON-LD: `SoftwareApplication`, `FAQPage`, `WebSite`).
- `app/sign-in/` and `app/sign-up/` — Clerk catch-all routes.
- `app/(authed)/layout.tsx` — calls `ensureUserRow()` to lazily upsert the Clerk user into the DB on first request, then renders `<AppNav>` + `<RegisterSW>`. Every page underneath assumes a valid user row exists.
- `app/api/cron/daily` — protected by `Bearer ${CRON_SECRET}`. Runs once daily (Vercel Hobby limit — see `vercel.json`); the per-user `NotifyLog (userId, channel, dayKey)` unique index dedups across retries.
- `app/api/webhooks/clerk` — svix-verified user.created/updated/deleted sync.
- `app/robots.ts`, `app/sitemap.ts`, `app/icon.tsx`, `app/apple-icon.tsx` — Next 15+ metadata routes.
- `proxy.ts` (formerly `middleware.ts`) — Clerk auth gate. Next 16 renamed `middleware` to `proxy`. Don't rename it back.

### FSRS scheduling boundary

`lib/fsrs.ts` is the only file that touches `ts-fsrs`. It exposes:
- `newCard(learnedAt)` — for capture (backdating-aware: a card learned 2 weeks ago is due 2 weeks ago).
- `toCard(item)` / `cardToDb(card)` — maps between our DB columns (camelCase) and ts-fsrs's `Card` (snake_case).
- `review(card, rating, now)` — applies a rating, returns next state.
- `previewAll(card, now)` — used for "what would each rating do?" UI hints.

When persisting after a review, **always go through `cardToDb`**, and **always write all FSRS fields** (`due`, `stability`, `difficulty`, `elapsedDays`, `scheduledDays`, `reps`, `lapses`, `state`, `lastReview`) in one transaction with the `Review` row (`app/(authed)/review/actions.ts:recordReview`).

### Server actions vs. route handlers

Server actions (`"use server"` in `app/(authed)/**/actions.ts`) handle all authenticated mutations — capture, review recording, settings, import, archive/delete. Route handlers under `app/api/` are reserved for things that aren't part of a normal page interaction: webhooks (Clerk), cron (Vercel), push subscription (programmatic from the SW register flow), and export downloads.

`requireUserId()` from `lib/user.ts` asserts auth at the top of every server action and route handler. Never trust a `userId` from the form body — always re-fetch from Clerk.

### AI features

`lib/anthropic.ts` is the only file allowed to construct an `Anthropic` client. It reads the per-user encrypted key from `User.anthropicKey`, decrypts via `lib/encryption.ts` (AES-256-GCM with `ENCRYPTION_KEY`), and instantiates a one-shot client. If the user hasn't set a key, `clientFor` returns `null` and the caller silently no-ops. **AI failures are never fatal** — capture succeeds without AI enrichment; review falls back to user self-rating if grading fails.

### Review session ordering

`lib/interleave.ts:interleaveByTag` round-robins items by primary tag before they reach the player. This is a research-backed retention boost (Rohrer & Taylor 2007) — don't replace it with a sort by due date for non-cram sessions. Cram mode (`?mode=cram`) bypasses both FSRS and interleaving.

### PWA and offline review

`public/sw.js` is hand-authored (no Workbox). It does two things:
1. Stale-while-revalidate for `/today` and `/review` HTML so a flaky train tunnel doesn't kill a review session.
2. Receives push events from the cron handler and shows a notification.

`components/RegisterSW.tsx` registers it from the (authed) layout. PWA icons (`public/icons/*.png`) are generated by `scripts/make-icons.mjs` — a pure-Node PNG encoder, no `sharp`/`canvas` dependency.

### Free-tier discipline

The whole product is designed to fit free tiers (Vercel Hobby, Neon 0.5GB, Clerk 10k MAU, Resend 3k/mo). If a change would risk any of those — adding a paid dependency, a polling worker, an unbounded data growth path — surface it before merging rather than silently breaking the budget.

## Repo conventions

- Commits are **conventional commits**, authored as `Archit1706 <architrathod77@gmail.com>`, **no `Co-Authored-By`** trailer, no Claude session footer.
- Push to `master` directly. No PRs unless explicitly requested. No `claude/*` branches.
- Default to **no comments**. Add one only when the *why* isn't obvious (hidden constraint, surprising invariant, FSRS quirk, etc.).
- Components live in `components/<feature>/`. Shared logic lives in `lib/`. Server actions colocate with the page that uses them (`app/(authed)/<route>/actions.ts`).
- `Prisma` `.map(...)` callbacks need **explicit param types** — CI's TypeScript is stricter than local's about inferring through Prisma include narrowings, and silent `implicit any` errors have broken builds before. Annotate every map/reduce that walks a Prisma include result.

## Tests

Vitest (`*.test.ts` colocated with source). Currently `fsrs`, `encryption`, `streak` — 17 tests. Tests are pure-logic only; no DB harness. If you add a feature that needs DB tests, set one up rather than mocking Prisma.
