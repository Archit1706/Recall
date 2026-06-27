# Recall

A free, self-hostable spaced-repetition learning app. Paste anything you learn — text, links, PDFs, markdown, code — and Recall schedules optimal reviews using the **FSRS** algorithm so it sticks.

> Calm second brain. Friction-free capture (<10s). Friction-free review (<30s). Built on free tiers, end to end.

## Status

Work in progress. See `IDEAS.md` for the roadmap.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind v4** + shadcn/ui
- **Prisma** + **Neon Postgres**
- **Clerk** auth
- **FSRS** via [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs)
- **Resend** email digests
- **Web Push** notifications (VAPID)
- **Vercel Cron** for daily reminders
- **Anthropic Claude API** for optional AI summaries, flashcard generation, and quiz grading

## Quickstart (local)

```bash
npm install
cp .env.example .env
# fill in DATABASE_URL, Clerk keys, generate VAPID + ENCRYPTION_KEY (see .env.example)
npm run db:push
npm run dev
```

Open <http://localhost:3000>.

## Generate secrets

```bash
# VAPID keys for web push
npm run vapid:generate

# 32-byte encryption key for per-user Anthropic API keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Cron secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deploy

1. Push to GitHub.
2. Import on Vercel; set env vars from `.env.example`.
3. Provision a Neon Postgres database (free tier). Set `DATABASE_URL` and `DIRECT_URL`.
4. Configure Clerk; set the webhook to `https://your-app.vercel.app/api/webhooks/clerk` with the `user.created` and `user.updated` events; copy the signing secret into `CLERK_WEBHOOK_SECRET`.
5. Configure Resend; verify a sending domain.
6. Add `CRON_SECRET`. Vercel Cron is configured in `vercel.json` and pings `/api/cron/daily` hourly.
7. Run `npm run db:push` against the Neon database (locally, or as a deploy step).

## Free-tier limits we respect

| Service | Limit |
|---|---|
| Vercel Hobby | 100 GB-hours functions, cron included |
| Neon Postgres | 0.5 GB storage |
| Clerk | 10,000 MAU |
| Resend | 3,000 emails/month, 100/day |
| Anthropic | user-supplied key, per-item toggle |

If a design choice threatens any of these, surface it.

## License

MIT.
