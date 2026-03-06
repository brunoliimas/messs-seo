"use client";

import { useEffect, useRef } from "react";
import { LETTER_TO_NUMERIC } from "@/lib/db/schema";

interface ScoreRingProps {
  score: string; // "B+", "A-", "D", etc.
  label: string; // "CWV", "SEO", etc.
  color?: string; // Cor do anel (default: purple)
  size?: number; // Tamanho em px (default: 100)
  strokeWidth?: number;
  animated?: boolean;
}

export function ScoreRing({
  score,
  label,
  color = "#8021de",
  size = 100,
  strokeWidth = 6,
  animated = true,
}: ScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const numeric = LETTER_TO_NUMERIC[score] ?? 0;
  const percentage = numeric / 100;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage);

  useEffect(() => {
    if (!animated || !circleRef.current) return;

    const el = circleRef.current;
    el.style.strokeDashoffset = `${circumference}`;

    // Trigger reflow
    void el.getBoundingClientRect();

    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1.2s ease-out";
      el.style.strokeDashoffset = `${offset}`;
    });
  }, [animated, circumference, offset]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Track (background) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={strokeWidth}
          />
          {/* Value (foreground) */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? circumference : offset}
          />
        </svg>

        {/* Score letter centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-metric-value font-mono"
            style={{
              fontSize: size * 0.3,
              color,
              fontFamily: "var(--font-family-mono)",
            }}
          >
            {score}
          </span>
        </div>
      </div>

      {/* Label */}
      <span className="text-metric text-[11px] text-[var(--text-muted)]">
        {label}
      </span>
    </div>
  );
}
