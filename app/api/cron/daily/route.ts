import { prisma } from "@/lib/prisma";
import { sendDigestEmail } from "@/lib/resend";
import { sendPushToUser } from "@/lib/push";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily cron (Vercel Hobby allows daily only). Fires once at 13:00 UTC.
 * For each user we check: (a) is there at least one item due? (b) have we
 * already notified today (per their local-day boundary)?
 * Sends an email digest and a web push.
 *
 * Idempotency: we write a NotifyLog row keyed by (userId, channel, dayKey).
 * The dayKey uses the user's local calendar day so timezone changes still dedup
 * correctly.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return new Response("unauthorized", { status: 401 });
  }

  const now = new Date();
  const users = await prisma.user.findMany({
    where: { OR: [{ emailEnabled: true }, { pushEnabled: true }] },
    select: { id: true, email: true, timezone: true, emailEnabled: true, pushEnabled: true },
  });

  let emailsSent = 0;
  let pushSent = 0;
  let skipped = 0;

  for (const u of users) {
    try {
      const local = localDayKey(now, u.timezone);
      const due = await prisma.item.findMany({
        where: { userId: u.id, archived: false, due: { lte: now } },
        orderBy: { due: "asc" },
        take: 8,
        select: { title: true },
      });
      if (due.length === 0) {
        skipped += 1;
        continue;
      }

      if (u.emailEnabled) {
        const log = await prisma.notifyLog
          .create({
            data: {
              userId: u.id,
              channel: "EMAIL",
              dayKey: local.dayKey,
              dueCount: due.length,
            },
            select: { id: true },
          })
          .catch(() => null);
        if (log) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://recall.app";
          const ok = await sendDigestEmail({
            to: u.email,
            dueCount: due.length,
            appUrl,
            unsubscribeUrl: `${appUrl}/settings`,
            topTitles: due.map((d) => d.title),
          });
          if (ok) emailsSent += 1;
        }
      }

      if (u.pushEnabled) {
        const log = await prisma.notifyLog
          .create({
            data: {
              userId: u.id,
              channel: "PUSH",
              dayKey: local.dayKey,
              dueCount: due.length,
            },
            select: { id: true },
          })
          .catch(() => null);
        if (log) {
          const delivered = await sendPushToUser(u.id, {
            title: "Recall",
            body: `${due.length} ${due.length === 1 ? "thing" : "things"} to remember.`,
            url: "/review",
            badge: due.length,
          }).catch(() => 0);
          pushSent += delivered;
        }
      }
    } catch (e) {
      console.error("[cron] user", u.id, e);
    }
  }

  return Response.json({ ok: true, emailsSent, pushSent, skipped, users: users.length });
}

function localDayKey(now: Date, tz: string): { dayKey: string } {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    return { dayKey: `${get("year")}-${get("month")}-${get("day")}` };
  } catch {
    return { dayKey: now.toISOString().slice(0, 10) };
  }
}
