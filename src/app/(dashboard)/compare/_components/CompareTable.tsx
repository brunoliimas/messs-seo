"use client";

import React from "react";
import type { BrandSummary } from "@/types";
import type { MockSnapshot } from "@/lib/mock-data";
import { formatMs, formatCLS } from "@/lib/utils/formatters";
import { getScoreColor } from "@/lib/utils/ratings";
import { getRatingColor, type Rating } from "@/lib/constants/thresholds";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CompareTableProps {
  brands: BrandSummary[];
  snapshots: Record<string, MockSnapshot[]>;
}

interface MetricRow {
  label: string;
  category: string;
  values: {
    brandSlug: string;
    display: string;
    rating: Rating | null;
    note?: string;
  }[];
}

function getBestIndex(values: { display: string; rating: Rating | null }[]): number {
  const ratingOrder: Record<string, number> = { good: 3, "needs-improvement": 2, poor: 1 };
  let bestIdx = 0;
  let bestScore = -1;
  values.forEach((v, i) => {
    if (v.display === "—") return;
    const score = ratingOrder[v.rating || ""] || 0;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  });
  return bestIdx;
}

function getCruxValue(
  snapshots: MockSnapshot[],
  strategy: string,
  metric: string,
  isOrigin: boolean = false
): { value: number | null; rating: string | null } {
  const snap = snapshots.find(
    (s) => s.source === "crux" && s.strategy === strategy && s.isOrigin === isOrigin
  );
  if (!snap) return { value: null, rating: null };
  return snap.metrics[metric] || { value: null, rating: null };
}

function getLighthouseValue(
  snapshots: MockSnapshot[],
  field: string
): number | null {
  const snap = snapshots.find((s) => s.source === "lighthouse");
  if (!snap?.lighthouse) return null;
  return (snap.lighthouse as any)[field] ?? null;
}

export function CompareTable({ brands, snapshots }: CompareTableProps) {
  const metricColWidth = "w-[180px]";
  const brandColWidth = "w-[170px] min-w-[170px] max-w-[170px]";
  const cellWrap = "whitespace-normal wrap-break-word break-normal";

  // ── Build score rows ──
  const scoreRows: MetricRow[] = [
    {
      label: "Core Web Vitals",
      category: "score",
      values: brands.map((b) => ({
        brandSlug: b.slug,
        display: b.scores.cwv.letter,
        rating: b.scores.cwv.numeric >= 90 ? "good" : b.scores.cwv.numeric >= 70 ? "needs-improvement" : "poor",
      })),
    },
    {
      label: "SEO",
      category: "score",
      values: brands.map((b) => ({
        brandSlug: b.slug,
        display: b.scores.seo.letter,
        rating: b.scores.seo.numeric >= 90 ? "good" : b.scores.seo.numeric >= 70 ? "needs-improvement" : "poor",
      })),
    },
    {
      label: "AEO",
      category: "score",
      values: brands.map((b) => ({
        brandSlug: b.slug,
        display: b.scores.aeo.letter,
        rating: b.scores.aeo.numeric >= 90 ? "good" : b.scores.aeo.numeric >= 70 ? "needs-improvement" : "poor",
      })),
    },
    {
      label: "LLM Parsers",
      category: "score",
      values: brands.map((b) => ({
        brandSlug: b.slug,
        display: b.scores.llm.letter,
        rating: b.scores.llm.numeric >= 90 ? "good" : b.scores.llm.numeric >= 70 ? "needs-improvement" : "poor",
      })),
    },
  ];

  // ── Build CWV Mobile rows ──
  const cwvMetrics = ["lcp", "inp", "cls", "ttfb"];
  const cwvLabels: Record<string, string> = {
    lcp: "LCP (Mobile)",
    inp: "INP (Mobile)",
    cls: "CLS (Mobile)",
    ttfb: "TTFB (Mobile)",
  };

  const cwvRows: MetricRow[] = cwvMetrics.map((metric) => ({
    label: cwvLabels[metric],
    category: "cwv",
    values: brands.map((b) => {
      const data = getCruxValue(snapshots[b.slug] || [], "mobile", metric);
      if (data.value === null) {
        const lhSnap = (snapshots[b.slug] || []).find((s) => s.source === "lighthouse");
        const lhVal = lhSnap?.metrics[metric]?.value ?? null;
        if (lhVal === null) return { brandSlug: b.slug, display: "—", rating: null, note: "Sem dados" };
        return {
          brandSlug: b.slug,
          display: metric === "cls" ? formatCLS(lhVal) : formatMs(lhVal),
          rating: (lhSnap?.metrics[metric]?.rating as Rating) || null,
          note: "Lab data",
        };
      }
      return {
        brandSlug: b.slug,
        display: metric === "cls" ? formatCLS(data.value) : formatMs(data.value),
        rating: data.rating as Rating,
      };
    }),
  }));

  // ── Lighthouse rows ──
  const lighthouseFields = [
    { key: "performance", label: "Performance" },
    { key: "accessibility", label: "Acessibilidade" },
    { key: "bestPractices", label: "Boas Práticas" },
    { key: "seo", label: "SEO (Lighthouse)" },
  ];

  const lighthouseRows: MetricRow[] = lighthouseFields.map((field) => ({
    label: field.label,
    category: "lighthouse",
    values: brands.map((b) => {
      const val = getLighthouseValue(snapshots[b.slug] || [], field.key);
      if (val === null) return { brandSlug: b.slug, display: "—", rating: null };
      return {
        brandSlug: b.slug,
        display: Math.round(val).toString(),
        rating: val >= 90 ? "good" : val >= 50 ? "needs-improvement" : ("poor" as Rating),
      };
    }),
  }));

  // ── Finding counts ──
  const findingRows: MetricRow[] = [
    {
      label: "Críticos",
      category: "findings",
      values: brands.map((b) => ({
        brandSlug: b.slug,
        display: b.findingCounts.critical.toString(),
        rating: b.findingCounts.critical <= 1 ? "good" : b.findingCounts.critical <= 3 ? "needs-improvement" : "poor",
      })),
    },
    {
      label: "Atenção",
      category: "findings",
      values: brands.map((b) => ({
        brandSlug: b.slug,
        display: b.findingCounts.warning.toString(),
        rating: "needs-improvement",
      })),
    },
    {
      label: "Positivos",
      category: "findings",
      values: brands.map((b) => ({
        brandSlug: b.slug,
        display: b.findingCounts.good.toString(),
        rating: "good",
      })),
    },
  ];

  // ── Platform info ──
  const infoRows: MetricRow[] = [
    {
      label: "Plataforma",
      category: "info",
      values: brands.map((b) => ({
        brandSlug: b.slug,
        display: b.platform || "—",
        rating: null,
      })),
    },
    {
      label: "Dados CrUX",
      category: "info",
      values: brands.map((b) => {
        const hasCrux = (snapshots[b.slug] || []).some((s) => s.source === "crux");
        return {
          brandSlug: b.slug,
          display: hasCrux ? "Disponível" : "Indisponível",
          rating: hasCrux ? "good" : ("poor" as Rating),
        };
      }),
    },
  ];

  const allSections = [
    { title: "SCORES GERAIS", rows: scoreRows },
    { title: "CORE WEB VITALS", rows: cwvRows },
    { title: "LIGHTHOUSE", rows: lighthouseRows },
    { title: "ACHADOS", rows: findingRows },
    { title: "INFORMAÇÕES", rows: infoRows },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className={`text-metric text-[10px] ${metricColWidth}`}>
                MÉTRICA
              </TableHead>
              {brands.map((brand) => (
                <TableHead
                  key={brand.slug}
                  className={`text-center ${brandColWidth} ${cellWrap}`}
                >
                  <div className={`flex flex-col items-center justify-center gap-1 w-full min-h-[64px] ${cellWrap}`}>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: brand.color || "#8021de" }}
                    />
                    <span className={`text-sm font-semibold text-foreground text-center ${cellWrap}`}>
                      {brand.name}
                    </span>
                    <span className={`text-metric text-[9px] text-muted-foreground text-center ${cellWrap}`}>
                      {brand.domain}
                    </span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {allSections.map((section) => (
              <React.Fragment key={section.title}>
                {/* Section header */}
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={brands.length + 1}
                    className="pt-5 pb-2 text-metric text-[10px] text-muted-foreground bg-muted/30"
                  >
                    {section.title}
                  </TableCell>
                </TableRow>

                {/* Rows */}
                {section.rows.map((row) => {
                  const bestIdx = getBestIndex(row.values);

                  return (
                    <TableRow key={row.label}>
                      <TableCell className={`text-muted-foreground ${metricColWidth} ${cellWrap}`}>
                        {row.label}
                      </TableCell>
                      {row.values.map((val, i) => {
                        const isBest =
                          i === bestIdx &&
                          val.display !== "—" &&
                          row.values.filter((v) => v.display !== "—").length > 1;

                        return (
                          <TableCell key={val.brandSlug} className={`text-center ${brandColWidth} ${cellWrap}`}>
                            <div className={`flex flex-col items-center gap-0.5 ${cellWrap}`}>
                              <span
                                className={
                                  row.category === "info" && row.label === "Plataforma"
                                    ? `text-sm text-(--text-secondary) leading-snug text-center ${cellWrap}`
                                    : `font-mono text-base text-center ${cellWrap}`
                                }
                                style={{
                                  fontFamily:
                                    row.category === "info" && row.label === "Plataforma"
                                      ? undefined
                                      : "var(--font-family-mono)",
                                  color: val.rating
                                    ? getRatingColor(val.rating)
                                    : "inherit",
                                }}
                              >
                                {val.display}
                              </span>
                              {val.note && (
                                <span className={`text-[10px] text-muted-foreground text-center ${cellWrap}`}>
                                  {val.note}
                                </span>
                              )}
                              {isBest && (
                                <span className="text-[9px] text-metric text-status-good">
                                  MELHOR
                                </span>
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
