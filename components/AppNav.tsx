"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Brain, CalendarCheck, Inbox, LineChart, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const tabs = [
  { href: "/today", label: "Today", icon: CalendarCheck },
  { href: "/items", label: "Library", icon: Inbox },
  { href: "/stats", label: "Stats", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppNav({ dueCount }: { dueCount?: number }) {
  const pathname = usePathname();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4">
          <Link href="/today" className="flex items-center gap-2 font-semibold">
            <Brain className="h-5 w-5" /> Recall
          </Link>
          <nav className="ml-3 hidden gap-1 sm:flex">
            {tabs.map((t) => {
              const active = pathname === t.href || pathname.startsWith(t.href + "/");
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]"
                      : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)]",
                  )}
                >
                  {t.label}
                  {t.href === "/today" && dueCount && dueCount > 0 ? (
                    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] font-semibold text-[var(--color-primary-foreground)]">
                      {dueCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/add"
              className="inline-flex items-center gap-1 rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary-foreground)] transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add
            </Link>
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-4xl grid-cols-4">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = pathname === t.href || pathname.startsWith(t.href + "/");
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-[11px]",
                  active
                    ? "text-[var(--color-foreground)]"
                    : "text-[var(--color-muted-foreground)]",
                )}
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
