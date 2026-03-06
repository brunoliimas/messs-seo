"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import type { TimelinePoint } from "@/lib/mock-data";
import { CWV_THRESHOLDS, type CWVMetric } from "@/lib/constants/thresholds";
import { formatMs, formatCLS } from "@/lib/utils/formatters";

interface MetricTimelineProps {
  data: TimelinePoint[];
  metricKey: string;
  label: string;
  brandColor: string;
  unit?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0];

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2.5 shadow-lg">
      <p
        className="text-[10px] mb-1.5"
        style={{
          fontFamily: "var(--font-family-mono)",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {label}
      </p>
      <p
        className="text-lg"
        style={{
          fontFamily: "var(--font-family-mono)",
          color: point.color,
        }}
      >
        {point.value !== null ? point.value : "—"}
      </p>
    </div>
  );
}

function getThreshold(metricKey: string) {
  const key = metricKey as CWVMetric;
  return CWV_THRESHOLDS[key] || null;
}

function formatValue(value: number, metricKey: string): string {
  if (metricKey === "cls") return formatCLS(value);
  if (["performanceScore", "accessibilityScore", "seoScore"].includes(metricKey)) {
    return Math.round(value).toString();
  }
  return formatMs(value);
}

function getYDomain(data: TimelinePoint[], metricKey: string): [number, number] {
  const values = data
    .map((d) => (d as any)[metricKey] as number | null)
    .filter((v): v is number => v !== null);

  if (values.length === 0) return [0, 100];

  const min = Math.min(...values);
  const max = Math.max(...values);

  const threshold = getThreshold(metricKey);
  if (threshold) {
    // Extend domain to include threshold zones
    const low = Math.min(min, 0) * 0.9;
    const high = Math.max(max, threshold.poor) * 1.15;
    return [Math.max(0, low), high];
  }

  // For Lighthouse scores (0-100)
  if (["performanceScore", "accessibilityScore", "seoScore"].includes(metricKey)) {
    return [Math.max(0, min - 10), 100];
  }

  const padding = (max - min) * 0.15 || 10;
  return [Math.max(0, min - padding), max + padding];
}

export function MetricTimeline({
  data,
  metricKey,
  label,
  brandColor,
}: MetricTimelineProps) {
  const threshold = getThreshold(metricKey);
  const isLighthouseScore = ["performanceScore", "accessibilityScore", "seoScore"].includes(metricKey);
  const [yMin, yMax] = getYDomain(data, metricKey);

  // Check if there's any data for this metric
  const hasData = data.some((d) => (d as any)[metricKey] !== null);

  if (!hasData) {
    return (
      <div className="card p-5">
        <p className="text-metric text-[10px] text-[var(--text-muted)] mb-3">
          {label}
        </p>
        <div className="h-48 flex items-center justify-center text-sm text-[var(--text-muted)]">
          Sem dados disponíveis para esta métrica
        </div>
      </div>
    );
  }

  // Format tick
  const tickFormatter = (value: number) => formatValue(value, metricKey);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-metric text-[10px] text-[var(--text-muted)]">
          {label}
        </p>
        {/* Latest value */}
        {data.length > 0 && (
          <span
            className="text-lg"
            style={{
              fontFamily: "var(--font-family-mono)",
              color: brandColor,
            }}
          >
            {(() => {
              const latest = (data[data.length - 1] as any)[metricKey];
              return latest !== null ? formatValue(latest, metricKey) : "—";
            })()}
          </span>
        )}
      </div>

      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-subtle)"
              vertical={false}
            />

            {/* Threshold reference areas for CWV metrics */}
            {threshold && (
              <>
                {/* Good zone */}
                <ReferenceArea
                  y1={yMin}
                  y2={threshold.good}
                  fill="#22c55e"
                  fillOpacity={0.04}
                />
                {/* Needs improvement zone */}
                <ReferenceArea
                  y1={threshold.good}
                  y2={threshold.poor}
                  fill="#eab308"
                  fillOpacity={0.04}
                />
                {/* Poor zone */}
                <ReferenceArea
                  y1={threshold.poor}
                  y2={yMax}
                  fill="#ef4444"
                  fillOpacity={0.04}
                />
              </>
            )}

            {/* Lighthouse score thresholds */}
            {isLighthouseScore && (
              <>
                <ReferenceArea
                  y1={90}
                  y2={100}
                  fill="#22c55e"
                  fillOpacity={0.04}
                />
                <ReferenceArea
                  y1={50}
                  y2={90}
                  fill="#eab308"
                  fillOpacity={0.04}
                />
                <ReferenceArea
                  y1={yMin}
                  y2={50}
                  fill="#ef4444"
                  fillOpacity={0.04}
                />
              </>
            )}

            <XAxis
              dataKey="label"
              tick={{
                fill: "var(--text-muted)",
                fontSize: 11,
                fontFamily: "var(--font-family-mono)",
              }}
              tickLine={false}
              axisLine={{ stroke: "var(--border-subtle)" }}
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={tickFormatter}
              tick={{
                fill: "var(--text-muted)",
                fontSize: 10,
                fontFamily: "var(--font-family-mono)",
              }}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={metricKey}
              stroke={brandColor}
              strokeWidth={2.5}
              dot={{
                fill: brandColor,
                strokeWidth: 0,
                r: 4,
              }}
              activeDot={{
                fill: brandColor,
                strokeWidth: 2,
                stroke: "var(--bg-surface)",
                r: 6,
              }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Threshold legend */}
      {(threshold || isLighthouseScore) && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-good" />
            <span className="text-[10px] text-[var(--text-muted)]">
              Bom {threshold ? `≤${formatValue(threshold.good, metricKey)}` : "≥90"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-warn" />
            <span className="text-[10px] text-[var(--text-muted)]">
              Precisa melhorar
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-bad" />
            <span className="text-[10px] text-[var(--text-muted)]">
              Ruim {threshold ? `>${formatValue(threshold.poor, metricKey)}` : "<50"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
