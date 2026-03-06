"use client";

import { useEffect, useRef } from "react";
import { getLighthouseRating, getRatingColor } from "@/lib/constants/thresholds";

interface LighthouseBarProps {
  label: string;
  score: number; // 0-100
  animated?: boolean;
}

export function LighthouseBar({
  label,
  score,
  animated = true,
}: LighthouseBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const rating = getLighthouseRating(score);
  const color = getRatingColor(rating);

  useEffect(() => {
    if (!animated || !barRef.current) return;

    const el = barRef.current;
    el.style.width = "0%";

    requestAnimationFrame(() => {
      el.style.transition = "width 1s ease-out";
      el.style.width = `${score}%`;
    });
  }, [animated, score]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        <span
          className="text-metric-value text-sm"
          style={{ fontFamily: "var(--font-family-mono)", color }}
        >
          {Math.round(score)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--border-subtle)] overflow-hidden">
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{
            backgroundColor: color,
            width: animated ? "0%" : `${score}%`,
          }}
        />
      </div>
    </div>
  );
}
