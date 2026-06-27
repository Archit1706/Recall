# Recall

A free, self-hostable **spaced-repetition learning app**. Paste anything you learn — text, links, PDFs, markdown, code — and Recall schedules optimal reviews using the **FSRS** algorithm so it sticks.

Calm second brain. Friction-free capture (under 10s). Friction-free review (under 30s). Built on free tiers, end to end.

---

## Features

**Capture**
- Smart textarea detects URLs, PDFs, markdown, code, plain text
- OpenGraph preview for links; PDF text extraction via `unpdf`
- Tags with create-on-type
- Pick when you actually learned it (backdate-friendly)
- 4 review modes per item: Flip / Type / Recall buttons / AI quiz
- Optional AI assist (per-item toggle): Claude generates a one-line summary, 3-5 key concepts, and 3 flashcard Q&A on save
- PWA share target — share any URL from your phone's share sheet straight into Recall
- Quick-add via URL params (`/add?title=…&url=…`) for browser bookmarklets and iOS Shortcuts
- Bulk import: paste one URL or note per line

**Review**
- FSRS scheduling (`ts-fsrs`), four ratings, full keyboard control
- Interleaved by tag (research-backed retention boost vs blocked practice)
- Elaboration prompt every 5th review ("how does this connect…")
- Cram mode: rotate through a tag without touching FSRS state
- AI quiz mode: Claude grades your typed answer and suggests a rating
- Offline-friendly via service worker

**Stay**
- Daily 08:00-local email digest (Resend) — only when there are due items
- Web push notifications (VAPID) — quiet, never duplicate per day
- GitHub-style activity heatmap, current + longest streak
- 30-day review-load forecast, retention-rate (30d), per-state breakdown
- Random refresher (a non-due item from >30 days ago)
- Full-text search across title, content, extracted PDF text
- Item-level notes for elaboration / connections

**Yours**
- Export JSON (full schema) and tab-separated Anki-importable file
- Bring your own Anthropic API key, encrypted at rest (AES-256-GCM)
- Dark mode, mobile-first, prefers-reduced-motion respected
- Conventional commits, vitest unit tests, strict TypeScript

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript strict |
| Styling | Tailwind v4 + shadcn-style tokens |
| Database | Neon Postgres + Prisma 7 (driver adapter, no native engine) |
| Auth | Clerk |
| SR algorithm | `ts-fsrs` |
| Email | Resend |
| Push | `web-push` (VAPID) |
| Cron | Vercel Cron (`vercel.json`) |
| PDF | `unpdf` |
| AI | Anthropic Claude SDK (user-supplied key) |

---

## Quickstart (local)

```bash
npm install
cp .env.example .env
# Fill in DATABASE_URL, Clerk keys, generate VAPID + ENCRYPTION_KEY (see below).
npx prisma generate
npx prisma db push
npm run dev
```

Then open <http://localhost:3000>.

### Generate the secrets you need

```bash
# 1) VAPID keys for web push
npm run vapid:generate
#    → paste VAPID_PUBLIC_KEY (also as NEXT_PUBLIC_VAPID_PUBLIC_KEY) and VAPID_PRIVATE_KEY

# 2) 32-byte hex encryption key (for storing user Anthropic keys at rest)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3) Random secret to protect the cron endpoint
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### PWA icons

A simple Node script renders monochrome PNG icons for the PWA — no `sharp` or `canvas` dependency. Run once to (re)generate:

```bash
node scripts/make-icons.mjs
```

Replace the output with your own art at any time.

---

## Deploy to Vercel

1. **Create a Neon project** (free). Copy the pooled URL → `DATABASE_URL`. Copy the direct (non-pooled) URL → `DIRECT_URL`.
2. **Create a Clerk app** (free). Copy `Publishable Key` → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `Secret Key` → `CLERK_SECRET_KEY`.
3. **Create a Resend account** (free), verify a sending domain, copy your API key → `RESEND_API_KEY`. Set `RESEND_FROM_EMAIL` to `"Recall <hello@yourdomain.com>"`.
4. **Push this repo to GitHub**, import on Vercel.
5. **Set env vars** on Vercel (copy from `.env.example`).
6. **Add a Clerk webhook**: URL `https://your-app.vercel.app/api/webhooks/clerk`, events `user.created`, `user.updated`, `user.deleted`. Copy the signing secret → `CLERK_WEBHOOK_SECRET`.
7. **Run migrations** against Neon: `DATABASE_URL=... DIRECT_URL=... npx prisma db push`.
8. The included `vercel.json` schedules `/api/cron/daily` hourly. Vercel will pass `Authorization: Bearer ${CRON_SECRET}` — set `CRON_SECRET` to a strong random value.

That's it.

---

## Free-tier limits we respect

| Service | Limit | Why we fit |
|---|---|---|
| Vercel Hobby | 100 GB-hours functions, cron included | Tiny payloads, no background workers |
| Neon Postgres | 0.5 GB storage | Items + reviews are small; full-text via `ILIKE` until you outgrow it |
| Clerk | 10k MAU | Per-user data is sub-KB |
| Resend | 3k emails/mo, 100/day | At most 1 digest/user/day, idempotent via `NotifyLog` |
| Anthropic | user-supplied key | Per-item toggle; Haiku is the default model |

If a future change threatens any of these, flag it before merging.

---

## Project layout

```
app/
  (authed)/         # protected routes (today, add, items, review, stats, settings)
  api/              # cron, push subscribe, webhooks, export
  sign-in/, sign-up/
  layout.tsx, page.tsx
components/
  capture/, items/, review/, settings/, stats/
  AppNav.tsx, ThemeToggle.tsx, RegisterSW.tsx
lib/
  fsrs.ts           # ts-fsrs wrapper + DB column mapping
  prisma.ts         # PrismaClient with Neon driver adapter
  user.ts           # auth helpers
  encryption.ts     # AES-256-GCM for user Anthropic keys
  anthropic.ts      # generation + grading
  push.ts, resend.ts, pdf.ts, og.ts
  stats.ts, streak.ts, interleave.ts, content.ts, prompts.ts
prisma/
  schema.prisma
public/
  manifest.json, sw.js, icons/
scripts/
  make-icons.mjs
proxy.ts            # Clerk middleware (renamed in Next 16)
prisma.config.ts    # Prisma 7 datasource config
vercel.json         # cron schedule
```

---

## Tests

```bash
npm test       # one shot
npm run test:watch
```

Currently 17 unit tests across `fsrs`, `encryption`, `streak`.

---

## License

MIT.
