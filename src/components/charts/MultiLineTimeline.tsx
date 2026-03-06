"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
} from "recharts";
import type { TimelinePoint } from "@/lib/mock-data";
import { CWV_THRESHOLDS, type CWVMetric } from "@/lib/constants/thresholds";
import { formatMs, formatCLS } from "@/lib/utils/formatters";

interface BrandTimeline {
  slug: string;
  name: string;
  color: string;
  data: TimelinePoint[];
}

interface MultiLineTimelineProps {
  brands: BrandTimeline[];
  metricKey: string;
  label: string;
}

function formatValue(value: number, metricKey: string): string {
  if (metricKey === "cls") return formatCLS(value);
  if (["performanceScore", "accessibilityScore", "seoScore"].includes(metricKey)) {
    return Math.round(value).toString();
  }
  return formatMs(value);
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 shadow-lg">
      <p
        className="text-[10px] mb-2"
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
        <div key={entry.name} className="flex items-center gap-2 text-sm mb-0.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[var(--text-secondary)] text-xs">
            {entry.name}:
          </span>
          <span
            className="text-sm"
            style={{
              fontFamily: "var(--font-family-mono)",
              color: entry.color,
            }}
          >
            {entry.value !== null && entry.value !== undefined ? entry.value : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MultiLineTimeline({
  brands,
  metricKey,
  label,
}: MultiLineTimelineProps) {
  // Merge data by date label
  const allLabels = brands[0]?.data.map((d) => d.label) || [];
  const mergedData = allLabels.map((label, i) => {
    const point: Record<string, string | number | null> = { label };
    brands.forEach((brand) => {
      const dp = brand.data[i];
      point[brand.name] = dp ? (dp as any)[metricKey] : null;
    });
    return point;
  });

  // Get threshold for reference areas
  const threshold = CWV_THRESHOLDS[metricKey as CWVMetric] || null;
  const isLighthouseScore = ["performanceScore", "accessibilityScore", "seoScore"].includes(metricKey);

  // Calculate Y domain
  const allValues = brands.flatMap((b) =>
    b.data.map((d) => (d as any)[metricKey] as number | null).filter((v): v is number => v !== null)
  );
  if (allValues.length === 0) return null;

  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const yMin = isLighthouseScore
    ? Math.max(0, min - 10)
    : Math.max(0, min * 0.8);
  const yMax = isLighthouseScore
    ? 100
    : threshold
      ? Math.max(max, threshold.poor) * 1.15
      : max * 1.15;

  return (
    <div className="card p-5">
      <p className="text-metric text-[10px] text-[var(--text-muted)] mb-4">
        {label} — COMPARATIVO
      </p>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={mergedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-subtle)"
              vertical={false}
            />

            {threshold && (
              <>
                <ReferenceArea y1={yMin} y2={threshold.good} fill="#22c55e" fillOpacity={0.03} />
                <ReferenceArea y1={threshold.good} y2={threshold.poor} fill="#eab308" fillOpacity={0.03} />
                <ReferenceArea y1={threshold.poor} y2={yMax} fill="#ef4444" fillOpacity={0.03} />
              </>
            )}
            {isLighthouseScore && (
              <>
                <ReferenceArea y1={90} y2={100} fill="#22c55e" fillOpacity={0.03} />
                <ReferenceArea y1={50} y2={90} fill="#eab308" fillOpacity={0.03} />
                <ReferenceArea y1={yMin} y2={50} fill="#ef4444" fillOpacity={0.03} />
              </>
            )}

            <XAxis
              dataKey="label"
              tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-family-mono)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--border-subtle)" }}
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={(v: number) => formatValue(v, metricKey)}
              tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "var(--font-family-mono)" }}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-family-mono)" }}
              iconType="circle"
              iconSize={8}
            />

            {brands.map((brand) => (
              <Line
                key={brand.slug}
                type="monotone"
                dataKey={brand.name}
                stroke={brand.color}
                strokeWidth={2}
                dot={{ fill: brand.color, strokeWidth: 0, r: 3 }}
                activeDot={{ fill: brand.color, stroke: "var(--bg-surface)", strokeWidth: 2, r: 5 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
