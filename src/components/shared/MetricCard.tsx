import type { Rating } from "@/lib/constants/thresholds";
import { getRatingColor } from "@/lib/constants/thresholds";

interface MetricCardProps {
  label: string;
  value: string;
  rating: Rating;
  sublabel?: string;
  compact?: boolean;
}

export function MetricCard({
  label,
  value,
  rating,
  sublabel,
  compact = false,
}: MetricCardProps) {
  const color = getRatingColor(rating);

  return (
    <div className="card overflow-hidden">
      {/* Top bar with rating color */}
      <div className="h-[2px]" style={{ backgroundColor: color }} />

      <div className={compact ? "px-3 py-2.5" : "px-4 py-3.5"}>
        <p className="text-metric text-[10px] text-[var(--text-muted)] mb-1">
          {label}
        </p>
        <p
          className={`font-mono ${compact ? "text-xl" : "text-2xl"}`}
          style={{
            fontFamily: "var(--font-family-mono)",
            color,
          }}
        >
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  );
}
