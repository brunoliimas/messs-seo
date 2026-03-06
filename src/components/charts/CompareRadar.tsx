"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { BrandSummary } from "@/types";

interface CompareRadarProps {
  brands: BrandSummary[];
}

const dimensions = [
  { key: "cwv", label: "CWV" },
  { key: "seo", label: "SEO" },
  { key: "aeo", label: "AEO" },
  { key: "llm", label: "LLM" },
] as const;

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 shadow-lg">
      <p
        className="text-xs mb-1.5"
        style={{
          fontFamily: "var(--font-family-mono)",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[var(--text-secondary)]">{entry.name}:</span>
          <span
            style={{
              fontFamily: "var(--font-family-mono)",
              color: entry.color,
            }}
          >
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CompareRadar({ brands }: CompareRadarProps) {
  // Transform data for Recharts RadarChart
  const data = dimensions.map((dim) => {
    const point: Record<string, string | number> = { metric: dim.label };
    brands.forEach((brand) => {
      const score = brand.scores[dim.key as keyof typeof brand.scores];
      point[brand.name] = score.numeric;
    });
    return point;
  });

  return (
    <div className="card p-6">
      <p className="text-metric text-[10px] text-[var(--text-muted)] mb-4">
        RADAR COMPARATIVO
      </p>
      <div className="w-full" style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid
              stroke="var(--border-subtle)"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="metric"
              tick={{
                fill: "var(--text-secondary)",
                fontSize: 12,
                fontFamily: "var(--font-family-mono)",
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fill: "var(--text-muted)",
                fontSize: 10,
                fontFamily: "var(--font-family-mono)",
              }}
              tickCount={5}
            />
            {brands.map((brand) => (
              <Radar
                key={brand.slug}
                name={brand.name}
                dataKey={brand.name}
                stroke={brand.color || "#8021de"}
                fill={brand.color || "#8021de"}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2">
        {brands.map((brand) => (
          <div key={brand.slug} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: brand.color || "#8021de" }}
            />
            <span className="text-xs text-[var(--text-secondary)]">
              {brand.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
