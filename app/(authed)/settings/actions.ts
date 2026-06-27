"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { encryptSecret } from "@/lib/encryption";

const SettingsSchema = z.object({
  timezone: z.string().min(1).max(100),
  emailEnabled: z.coerce.boolean().optional().default(false),
  pushEnabled: z.coerce.boolean().optional().default(false),
  anthropicModel: z.string().max(100).optional().default(""),
  anthropicKey: z.string().max(500).optional().default(""),
  clearKey: z.coerce.boolean().optional().default(false),
});

export type SettingsState = { ok: true } | { ok: false; error: string } | null;

export async function updateSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const userId = await requireUserId();
  const parsed = SettingsSchema.safeParse({
    timezone: formData.get("timezone"),
    emailEnabled: formData.get("emailEnabled") === "on",
    pushEnabled: formData.get("pushEnabled") === "on",
    anthropicModel: formData.get("anthropicModel") || "",
    anthropicKey: formData.get("anthropicKey") || "",
    clearKey: formData.get("clearKey") === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  const d = parsed.data;

  const data: Record<string, unknown> = {
    timezone: d.timezone,
    emailEnabled: d.emailEnabled,
    pushEnabled: d.pushEnabled,
    anthropicModel: d.anthropicModel || null,
  };
  if (d.clearKey) {
    data.anthropicKey = null;
  } else if (d.anthropicKey && d.anthropicKey.trim()) {
    try {
      data.anthropicKey = encryptSecret(d.anthropicKey.trim());
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }

  await prisma.user.update({ where: { id: userId }, data });
  revalidatePath("/settings");
  return { ok: true };
}
