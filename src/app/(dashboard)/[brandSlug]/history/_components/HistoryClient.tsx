"use client";

import { useState } from "react";
import { MetricTimeline } from "@/components/charts/MetricTimeline";
import { MultiLineTimeline } from "@/components/charts/MultiLineTimeline";
import { BarChart3, Layers } from "lucide-react";
import type { BrandSummary } from "@/types";
import type { TimelinePoint } from "@/lib/mock-data";

interface HistoryClientProps {
  brand: BrandSummary;
  timeline: TimelinePoint[];
  allBrandsTimeline: { slug: string; name: string; color: string; data: TimelinePoint[] }[];
}

type ViewMode = "single" | "compare";

interface MetricOption {
  key: string;
  label: string;
  group: string;
}

const metricOptions: MetricOption[] = [
  // Core Web Vitals
  { key: "lcp", label: "LCP", group: "Core Web Vitals" },
  { key: "inp", label: "INP", group: "Core Web Vitals" },
  { key: "cls", label: "CLS", group: "Core Web Vitals" },
  { key: "ttfb", label: "TTFB", group: "Core Web Vitals" },
  { key: "fcp", label: "FCP", group: "Core Web Vitals" },
  // Lab Metrics
  { key: "tbt", label: "TBT", group: "Lab Metrics" },
  { key: "si", label: "Speed Index", group: "Lab Metrics" },
  { key: "tti", label: "TTI", group: "Lab Metrics" },
  // Lighthouse Scores
  { key: "performanceScore", label: "Performance", group: "Lighthouse" },
  { key: "accessibilityScore", label: "Acessibilidade", group: "Lighthouse" },
  { key: "seoScore", label: "SEO Score", group: "Lighthouse" },
];

const metricLabels: Record<string, string> = {
  lcp: "Largest Contentful Paint (LCP)",
  inp: "Interaction to Next Paint (INP)",
  cls: "Cumulative Layout Shift (CLS)",
  ttfb: "Time to First Byte (TTFB)",
  fcp: "First Contentful Paint (FCP)",
  tbt: "Total Blocking Time (TBT)",
  si: "Speed Index (SI)",
  tti: "Time to Interactive (TTI)",
  performanceScore: "Performance Score",
  accessibilityScore: "Accessibility Score",
  seoScore: "SEO Score",
};

export function HistoryClient({
  brand,
  timeline,
  allBrandsTimeline,
}: HistoryClientProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    new Set(["lcp", "cls", "performanceScore"])
  );
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const brandColor = brand.color || "#8021de";

  function toggleMetric(key: string) {
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const groups = [...new Set(metricOptions.map((m) => m.group))];

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-button)]">
          <button
            onClick={() => setViewMode("single")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: viewMode === "single" ? `${brandColor}15` : "transparent",
              color: viewMode === "single" ? brandColor : "var(--text-secondary)",
            }}
          >
            <BarChart3 size={13} />
            {brand.name}
          </button>
          <button
            onClick={() => setViewMode("compare")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: viewMode === "compare" ? `${brandColor}15` : "transparent",
              color: viewMode === "compare" ? brandColor : "var(--text-secondary)",
            }}
          >
            <Layers size={13} />
            Comparar marcas
          </button>
        </div>

        {/* Period info */}
        <span className="text-metric text-[10px] text-[var(--text-muted)]">
          {timeline.length > 0
            ? `${timeline[0].label} → ${timeline[timeline.length - 1].label}`
            : "SEM DADOS"}
          {" "}— {timeline.length} MESES
        </span>
      </div>

      {/* Metric selector pills */}
      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group} className="flex items-center gap-2 flex-wrap">
            <span className="text-metric text-[9px] text-[var(--text-muted)] w-20 shrink-0">
              {group === "Core Web Vitals" ? "CWV" : group === "Lab Metrics" ? "LAB" : "SCORES"}
            </span>
            {metricOptions
              .filter((m) => m.group === group)
              .map((metric) => {
                const isActive = selectedMetrics.has(metric.key);
                // Check if brand has data for this metric
                const hasData = timeline.some(
                  (d) => (d as any)[metric.key] !== null
                );

                return (
                  <button
                    key={metric.key}
                    onClick={() => toggleMetric(metric.key)}
                    disabled={!hasData}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: "var(--font-family-mono)",
                      backgroundColor: isActive ? `${brandColor}15` : "var(--bg-surface-alt)",
                      color: isActive ? brandColor : "var(--text-secondary)",
                      border: `1px solid ${isActive ? `${brandColor}30` : "var(--border-subtle)"}`,
                    }}
                  >
                    {metric.label}
                    {!hasData && " ✕"}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[...selectedMetrics].map((metricKey) => {
          const label = metricLabels[metricKey] || metricKey;

          if (viewMode === "compare") {
            return (
              <MultiLineTimeline
                key={metricKey}
                brands={allBrandsTimeline}
                metricKey={metricKey}
                label={label}
              />
            );
          }

          return (
            <MetricTimeline
              key={metricKey}
              data={timeline}
              metricKey={metricKey}
              label={label}
              brandColor={brandColor}
            />
          );
        })}
      </div>

      {selectedMetrics.size === 0 && (
        <div className="card p-8 text-center text-[var(--text-muted)] text-sm">
          Selecione pelo menos uma métrica acima.
        </div>
      )}

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(() => {
          const first = timeline[0];
          const last = timeline[timeline.length - 1];
          if (!first || !last) return null;

          const insights = [
            {
              label: "LCP",
              before: first.lcp,
              after: last.lcp,
              unit: "ms",
              lowerIsBetter: true,
            },
            {
              label: "CLS",
              before: first.cls,
              after: last.cls,
              unit: "",
              lowerIsBetter: true,
            },
            {
              label: "Performance",
              before: first.performanceScore,
              after: last.performanceScore,
              unit: "",
              lowerIsBetter: false,
            },
          ];

          return insights.map((ins) => {
            if (ins.before === null || ins.after === null) return null;
            const diff = ins.after - ins.before;
            const improved = ins.lowerIsBetter ? diff < 0 : diff > 0;
            const pct = ((Math.abs(diff) / ins.before) * 100).toFixed(0);

            return (
              <div key={ins.label} className="card p-4">
                <p className="text-metric text-[10px] text-[var(--text-muted)] mb-1">
                  {ins.label} — VARIAÇÃO 6 MESES
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-2xl"
                    style={{
                      fontFamily: "var(--font-family-mono)",
                      color: improved
                        ? "var(--color-status-good)"
                        : "var(--color-status-bad)",
                    }}
                  >
                    {improved ? "↓" : "↑"} {pct}%
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {ins.label === "CLS"
                      ? `${ins.before.toFixed(2)} → ${ins.after.toFixed(2)}`
                      : `${Math.round(ins.before)} → ${Math.round(ins.after)}`}
                  </span>
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
