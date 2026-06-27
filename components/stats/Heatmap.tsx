import type { HeatmapCell } from "@/lib/stats";

export function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  // 7 rows (day of week) × 53 columns (weeks). We pad so the first column starts
  // on the right weekday — but a simple flow looks fine and is mobile-friendly.
  const max = Math.max(1, ...cells.map((c) => c.count));
  return (
    <div
      className="grid grid-flow-col grid-rows-7 gap-[3px]"
      role="figure"
      aria-label="Review activity over the past year"
    >
      {cells.map((cell) => {
        const intensity = cell.count === 0 ? 0 : Math.min(4, Math.ceil((cell.count / max) * 4));
        return (
          <div
            key={cell.date}
            title={`${cell.date} · ${cell.count} ${cell.count === 1 ? "review" : "reviews"}`}
            className={`h-[10px] w-[10px] rounded-sm ${TONE[intensity]}`}
          />
        );
      })}
    </div>
  );
}

const TONE = [
  "bg-[var(--color-secondary)]",
  "bg-emerald-500/20",
  "bg-emerald-500/40",
  "bg-emerald-500/70",
  "bg-emerald-500",
];
