import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * Returns the current Clerk user id, asserting auth. Server-only.
 * Use inside server components, server actions, and route handlers.
 */
export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

/**
 * Upserts the User row from Clerk. Called lazily from the (authed) layout so a
 * brand-new sign-in works even if the Clerk webhook hasn't fired yet.
 */
export async function ensureUserRow(): Promise<string> {
  const userId = await requireUserId();
  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (existing) return userId;

  const cu = await currentUser();
  const email =
    cu?.primaryEmailAddress?.emailAddress ??
    cu?.emailAddresses?.[0]?.emailAddress ??
    `${userId}@placeholder.local`;

  await prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, email },
    update: { email },
  });
  return userId;
}
