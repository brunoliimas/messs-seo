// ============================================================================
// Persist PageSpeed Insights result into snapshots table
// Used by cron daily and (optional) manual collect
// ============================================================================

import { db, schema } from "@/lib/db";
import type { NewSnapshot } from "@/lib/db/schema";
import { collectPageSpeed, type PSIResult } from "@/lib/collectors/pagespeed";
import { getRating, type CWVMetric } from "@/lib/constants/thresholds";
import { getGlobalRateLimiter } from "./rateLimit";

function fieldValue(
  metric: { percentiles?: { p75?: number } } | null | undefined
): number | null {
  const p75 = metric?.percentiles?.p75;
  return p75 != null ? p75 : null;
}

function toRating(value: number | null, metric: CWVMetric): string | null {
  if (value == null) return null;
  return getRating(value, metric);
}

/**
 * Maps PSIResult to a single snapshot row (lighthouse + lab + field when present).
 */
function psiToSnapshotRow(params: {
  brandId: string;
  url: string;
  strategy: "mobile" | "desktop";
  result: PSIResult;
}): NewSnapshot {
  const { brandId, url, strategy, result } = params;
  const { lighthouse, labMetrics, fieldMetrics, rawData } = result;

  // Field metrics: use p75 when available, else lab
  const lcpVal =
    fieldValue(fieldMetrics.lcp) ?? labMetrics.lcp ?? null;
  const inpVal =
    fieldValue(fieldMetrics.inp) ?? null;
  const clsVal =
    fieldValue(fieldMetrics.cls) ?? labMetrics.cls ?? null;
  const fcpVal =
    fieldValue(fieldMetrics.fcp) ?? labMetrics.fcp ?? null;
  const ttfbVal =
    fieldValue(fieldMetrics.ttfb) ?? labMetrics.ttfb ?? null;

  return {
    brandId,
    date: new Date(),
    source: "lighthouse",
    strategy,
    url,
    isOrigin: false,
    performanceScore: lighthouse.performance,
    accessibilityScore: lighthouse.accessibility,
    bestPracticesScore: lighthouse.bestPractices,
    seoScore: lighthouse.seo,
    lcpValue: lcpVal,
    lcpRating: toRating(lcpVal, "lcp"),
    inpValue: inpVal,
    inpRating: toRating(inpVal, "inp"),
    clsValue: clsVal,
    clsRating: toRating(clsVal, "cls"),
    fcpValue: fcpVal,
    fcpRating: toRating(fcpVal, "fcp"),
    ttfbValue: ttfbVal,
    ttfbRating: toRating(ttfbVal, "ttfb"),
    tbtValue: labMetrics.tbt,
    speedIndex: labMetrics.si,
    ttiValue: labMetrics.tti,
    rawData: rawData ?? undefined,
  };
}

/**
 * Collects PageSpeed for one URL+strategy and inserts one row into snapshots.
 * Uses global rate limiter to avoid hitting API quota.
 */
export async function persistPageSpeed(params: {
  brandId: string;
  url: string;
  strategy: "mobile" | "desktop";
}): Promise<{ inserted: number }> {
  await getGlobalRateLimiter()();

  const result = await collectPageSpeed({
    url: params.url,
    strategy: params.strategy,
    categories: ["performance", "accessibility", "best-practices", "seo"],
  });

  const row = psiToSnapshotRow({
    brandId: params.brandId,
    url: params.url,
    strategy: params.strategy,
    result,
  });

  await db.insert(schema.snapshots).values(row);
  return { inserted: 1 };
}

/**
 * Collects PageSpeed for mobile + desktop and inserts two snapshot rows.
 * Used by cron daily per brand.
 */
export async function persistPageSpeedBothStrategies(params: {
  brandId: string;
  url: string;
}): Promise<{ inserted: number }> {
  let inserted = 0;

  for (const strategy of ["mobile", "desktop"] as const) {
    const r = await persistPageSpeed({
      brandId: params.brandId,
      url: params.url,
      strategy,
    });
    inserted += r.inserted;
  }

  return { inserted };
}
