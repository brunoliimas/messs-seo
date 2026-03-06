// ============================================================================
// Tipos compartilhados do dashboard
// Tipos de banco (inferidos) estão em lib/db/schema.ts
// Estes são tipos de apresentação / API
// ============================================================================

/** Resumo de uma marca para o overview */
export interface BrandSummary {
  id: string;
  name: string;
  slug: string;
  domain: string;
  platform: string | null;
  color: string | null;
  gradient: string | null;
  scores: {
    cwv: { letter: string; numeric: number };
    seo: { letter: string; numeric: number };
    aeo: { letter: string; numeric: number };
    llm: { letter: string; numeric: number };
  };
  findingCounts: {
    critical: number;
    warning: number;
    good: number;
  };
  latestSnapshot?: {
    date: string;
    source: string;
    strategy: string;
    performanceScore: number | null;
  };
}

/** Dados para o gráfico de evolução temporal */
export interface TimelineDataPoint {
  date: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
}

/** Dados para o comparativo */
export interface ComparisonMetric {
  metric: string;
  label: string;
  brands: {
    brandSlug: string;
    brandName: string;
    value: number | string;
    rating: "good" | "needs-improvement" | "poor";
  }[];
}

/** Score ring props */
export interface ScoreDisplay {
  letter: string;
  numeric: number;
  label: string;
  color: string;
}
