import webpush, { type PushSubscription as WebPushSubscription } from "web-push";
import { prisma } from "./prisma";

let configured = false;

function configure(): void {
  if (configured) return;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:noreply@example.com";
  if (!pub || !priv) {
    throw new Error("VAPID keys missing — run: npm run vapid:generate");
  }
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  badge?: number;
};

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  configure();
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  let delivered = 0;
  for (const s of subs) {
    const sub: WebPushSubscription = {
      endpoint: s.endpoint,
      keys: { p256dh: s.p256dh, auth: s.auth },
    };
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
      delivered += 1;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      // 410 = unsubscribed; 404 = endpoint missing. Drop the row.
      if (status === 410 || status === 404) {
        await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
      } else {
        console.error("[push] delivery failed", err);
      }
    }
  }
  return delivered;
}
