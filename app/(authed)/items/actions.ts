"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";

export async function saveNotes(itemId: string, notes: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.item.updateMany({
    where: { id: itemId, userId },
    data: { notes: notes.slice(0, 5000) },
  });
  revalidatePath(`/items/${itemId}`);
}

export async function archiveItem(itemId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.item.updateMany({
    where: { id: itemId, userId },
    data: { archived: true },
  });
  revalidatePath("/items");
  redirect("/items");
}

export async function deleteItem(itemId: string): Promise<void> {
  const userId = await requireUserId();
  await prisma.item.deleteMany({ where: { id: itemId, userId } });
  revalidatePath("/items");
  redirect("/items");
}
