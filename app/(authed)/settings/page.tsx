import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { maskApiKey } from "@/lib/encryption";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { PushToggle } from "@/components/settings/PushToggle";
import { ImportExport } from "@/components/settings/ImportExport";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      timezone: true,
      emailEnabled: true,
      pushEnabled: true,
      anthropicKey: true,
      anthropicModel: true,
    },
  });

  // Mask the stored Anthropic key for display only. The encrypted blob is opaque
  // and would tell us nothing; show "set" + an obvious clue.
  const keyDisplay = user?.anthropicKey ? maskApiKey(user.anthropicKey) : null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {user?.email}
        </p>
      </header>

      <SettingsForm
        defaults={{
          timezone: user?.timezone ?? "UTC",
          emailEnabled: user?.emailEnabled ?? true,
          pushEnabled: user?.pushEnabled ?? true,
          anthropicModel: user?.anthropicModel ?? "",
          anthropicKeyMasked: keyDisplay,
        }}
      />

      <section className="space-y-2 rounded-2xl border border-[var(--color-border)] p-4">
        <h2 className="text-sm font-medium">Web push</h2>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Get a single quiet ping when something is due. We never send when 0 items are due.
        </p>
        <PushToggle initialEnabled={user?.pushEnabled ?? false} />
      </section>

      <ImportExport />
    </div>
  );
}
