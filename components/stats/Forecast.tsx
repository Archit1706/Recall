import type { Forecast as ForecastData } from "@/lib/stats";

export function Forecast({ data }: { data: ForecastData }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex h-32 items-end gap-1" role="figure" aria-label="30-day review forecast">
      {data.map((d) => {
        const h = (d.count / max) * 100;
        return (
          <div
            key={d.date}
            title={`${d.date} · ${d.count} due`}
            className="flex-1 rounded-t bg-[var(--color-primary)]/60 transition-colors hover:bg-[var(--color-primary)]"
            style={{ height: `${Math.max(h, d.count > 0 ? 6 : 1)}%` }}
          />
        );
      })}
    </div>
  );
}
