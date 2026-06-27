import { AddItemForm } from "@/components/capture/AddItemForm";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function AddPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; url?: string; text?: string }>;
}) {
  const userId = await requireUserId();
  const tags = await prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, color: true },
  });
  const sp = await searchParams;
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Add</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Capture anything. Cmd/Ctrl+Enter to save.
        </p>
      </header>
      <AddItemForm
        existingTags={tags}
        prefill={{
          title: sp.title ?? "",
          content: sp.url ?? sp.text ?? "",
        }}
      />
    </div>
  );
}
