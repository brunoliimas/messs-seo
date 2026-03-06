// ============================================================================
// PageSpeed Insights API Collector
// Docs: https://developers.google.com/speed/docs/insights/v5/get-started
// Limite: 25.000 req/dia (gratuito com API key)
// ============================================================================

const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export interface PSIOptions {
  url: string;
  strategy: "mobile" | "desktop";
  categories?: (
    | "performance"
    | "accessibility"
    | "best-practices"
    | "seo"
  )[];
}

export interface PSIResult {
  lighthouse: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
  labMetrics: {
    fcp: number | null;
    lcp: number | null;
    tbt: number | null;
    cls: number | null;
    si: number | null;
    tti: number | null;
    ttfb: number | null;
  };
  fieldMetrics: {
    lcp: CrUXMetricData | null;
    inp: CrUXMetricData | null;
    cls: CrUXMetricData | null;
    fcp: CrUXMetricData | null;
    ttfb: CrUXMetricData | null;
  };
  originMetrics: {
    lcp: CrUXMetricData | null;
    inp: CrUXMetricData | null;
    cls: CrUXMetricData | null;
  };
  rawData: unknown;
}

interface CrUXMetricData {
  percentiles: { p75: number };
  distributions: { min: number; max: number; proportion: number }[];
  category: string;
}

export async function collectPageSpeed(
  options: PSIOptions
): Promise<PSIResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is required for PageSpeed API");
  }

  const categories = options.categories || [
    "performance",
    "accessibility",
    "best-practices",
    "seo",
  ];

  const params = new URLSearchParams({
    url: options.url,
    strategy: options.strategy,
    key: apiKey,
  });
  categories.forEach((c) => params.append("category", c));

  const response = await fetch(`${PSI_API}?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `PageSpeed API error ${response.status}: ${errorBody.slice(0, 200)}`
    );
  }

  const data = await response.json();

  // Extrair scores Lighthouse
  const cats = data.lighthouseResult?.categories || {};
  const audits = data.lighthouseResult?.audits || {};

  // Extrair CrUX Field Data (pode não existir para sites com pouco tráfego)
  const fieldData = data.loadingExperience?.metrics || {};
  const originData = data.originLoadingExperience?.metrics || {};

  return {
    lighthouse: {
      performance: cats.performance?.score != null ? cats.performance.score * 100 : null,
      accessibility: cats.accessibility?.score != null ? cats.accessibility.score * 100 : null,
      bestPractices: cats["best-practices"]?.score != null ? cats["best-practices"].score * 100 : null,
      seo: cats.seo?.score != null ? cats.seo.score * 100 : null,
    },
    labMetrics: {
      fcp: audits["first-contentful-paint"]?.numericValue ?? null,
      lcp: audits["largest-contentful-paint"]?.numericValue ?? null,
      tbt: audits["total-blocking-time"]?.numericValue ?? null,
      cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
      si: audits["speed-index"]?.numericValue ?? null,
      tti: audits["interactive"]?.numericValue ?? null,
      ttfb: audits["server-response-time"]?.numericValue ?? null,
    },
    fieldMetrics: {
      lcp: fieldData.LARGEST_CONTENTFUL_PAINT_MS ?? null,
      inp: fieldData.INTERACTION_TO_NEXT_PAINT ?? null,
      cls: fieldData.CUMULATIVE_LAYOUT_SHIFT_SCORE ?? null,
      fcp: fieldData.FIRST_CONTENTFUL_PAINT_MS ?? null,
      ttfb: fieldData.EXPERIMENTAL_TIME_TO_FIRST_BYTE ?? null,
    },
    originMetrics: {
      lcp: originData.LARGEST_CONTENTFUL_PAINT_MS ?? null,
      inp: originData.INTERACTION_TO_NEXT_PAINT ?? null,
      cls: originData.CUMULATIVE_LAYOUT_SHIFT_SCORE ?? null,
    },
    rawData: data,
  };
}
