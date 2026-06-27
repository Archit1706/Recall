import { ensureUserRow } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/AppNav";
import { RegisterSW } from "@/components/RegisterSW";

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const userId = await ensureUserRow();
  const dueCount = await prisma.item.count({
    where: { userId, archived: false, due: { lte: new Date() } },
  });

  return (
    <div className="min-h-dvh pb-20 sm:pb-0">
      <RegisterSW />
      <AppNav dueCount={dueCount} />
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
