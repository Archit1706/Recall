import { headers } from "next/headers";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type WebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string; id: string }[];
    primary_email_address_id?: string | null;
  };
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("CLERK_WEBHOOK_SECRET not set", { status: 500 });
  }

  const h = await headers();
  const svixId = h.get("svix-id");
  const svixTs = h.get("svix-timestamp");
  const svixSig = h.get("svix-signature");
  if (!svixId || !svixTs || !svixSig) {
    return new Response("missing svix headers", { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(secret);
  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTs,
      "svix-signature": svixSig,
    }) as WebhookEvent;
  } catch {
    return new Response("invalid signature", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const id = evt.data.id;
    const primaryId = evt.data.primary_email_address_id;
    const emails = evt.data.email_addresses ?? [];
    const primary = emails.find((e) => e.id === primaryId) ?? emails[0];
    const email = primary?.email_address ?? `${id}@placeholder.local`;
    await prisma.user.upsert({
      where: { id },
      create: { id, email },
      update: { email },
    });
  } else if (evt.type === "user.deleted") {
    await prisma.user.delete({ where: { id: evt.data.id } }).catch(() => {});
  }

  return new Response("ok");
}
