// ============================================================================
// Limiares oficiais — Core Web Vitals + Lighthouse
// Fonte: web.dev/vitals + Chrome UX Report
// ============================================================================

export const CWV_THRESHOLDS = {
  lcp: {
    good: 2500,
    poor: 4000,
    unit: "ms",
    label: "Largest Contentful Paint",
  },
  inp: {
    good: 200,
    poor: 500,
    unit: "ms",
    label: "Interaction to Next Paint",
  },
  cls: {
    good: 0.1,
    poor: 0.25,
    unit: "",
    label: "Cumulative Layout Shift",
  },
  fcp: {
    good: 1800,
    poor: 3000,
    unit: "ms",
    label: "First Contentful Paint",
  },
  ttfb: {
    good: 800,
    poor: 1800,
    unit: "ms",
    label: "Time to First Byte",
  },
  tbt: {
    good: 200,
    poor: 600,
    unit: "ms",
    label: "Total Blocking Time",
  },
  si: {
    good: 3300,
    poor: 5800,
    unit: "ms",
    label: "Speed Index",
  },
  tti: {
    good: 3800,
    poor: 7300,
    unit: "ms",
    label: "Time to Interactive",
  },
} as const;

export type CWVMetric = keyof typeof CWV_THRESHOLDS;

export const LIGHTHOUSE_THRESHOLDS = {
  good: 90, // Verde (0.9+)
  medium: 50, // Laranja (0.5-0.89)
  // Abaixo de 50 = Vermelho
} as const;

export type Rating = "good" | "needs-improvement" | "poor";

export function getRating(value: number, metric: CWVMetric): Rating {
  const t = CWV_THRESHOLDS[metric];
  if (value <= t.good) return "good";
  if (value <= t.poor) return "needs-improvement";
  return "poor";
}

export function getLighthouseRating(
  score: number
): "good" | "needs-improvement" | "poor" {
  if (score >= LIGHTHOUSE_THRESHOLDS.good) return "good";
  if (score >= LIGHTHOUSE_THRESHOLDS.medium) return "needs-improvement";
  return "poor";
}

export function getRatingColor(rating: Rating): string {
  switch (rating) {
    case "good":
      return "var(--color-status-good)";
    case "needs-improvement":
      return "var(--color-status-orange)";
    case "poor":
      return "var(--color-status-bad)";
  }
}
