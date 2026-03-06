// ============================================================================
// Chrome User Experience Report (CrUX) API Collector
// Docs: https://developer.chrome.com/docs/crux/api
// Limite: 150 req/min
// Dados atualizam semanalmente (toda segunda-feira)
// ============================================================================

const CRUX_API =
  "https://chromeuxreport.googleapis.com/v1/records:queryRecord";

export interface CrUXResult {
  hasData: boolean;
  record?: CrUXRecord;
}

export interface CrUXRecord {
  key: {
    url?: string;
    origin?: string;
    formFactor?: string;
  };
  metrics: {
    largest_contentful_paint?: CrUXMetric;
    interaction_to_next_paint?: CrUXMetric;
    cumulative_layout_shift?: CrUXMetric;
    experimental_time_to_first_byte?: CrUXMetric;
    first_contentful_paint?: CrUXMetric;
  };
  collectionPeriod: {
    firstDate: { year: number; month: number; day: number };
    lastDate: { year: number; month: number; day: number };
  };
}

export interface CrUXMetric {
  histogram: { start: number; end?: number; density: number }[];
  percentiles: { p75: number };
}

/**
 * Coleta dados CrUX para uma URL específica
 * Retorna hasData: false se o site não tem tráfego suficiente (404)
 */
export async function collectCrUX(
  url: string,
  formFactor: "PHONE" | "DESKTOP"
): Promise<CrUXResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is required for CrUX API");
  }

  const response = await fetch(`${CRUX_API}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      formFactor,
      metrics: [
        "largest_contentful_paint",
        "interaction_to_next_paint",
        "cumulative_layout_shift",
        "experimental_time_to_first_byte",
        "first_contentful_paint",
      ],
    }),
  });

  // CrUX retorna 404 se não houver dados suficientes
  if (response.status === 404) {
    return { hasData: false };
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `CrUX API error ${response.status}: ${errorBody.slice(0, 200)}`
    );
  }

  const data = await response.json();
  return { hasData: true, record: data.record };
}

/**
 * Coleta dados CrUX para o origin (domínio inteiro)
 * Útil para ver métricas agregadas vs URL específica
 */
export async function collectCrUXOrigin(
  origin: string,
  formFactor: "PHONE" | "DESKTOP"
): Promise<CrUXResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is required for CrUX API");
  }

  const response = await fetch(`${CRUX_API}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin,
      formFactor,
      metrics: [
        "largest_contentful_paint",
        "interaction_to_next_paint",
        "cumulative_layout_shift",
        "experimental_time_to_first_byte",
        "first_contentful_paint",
      ],
    }),
  });

  if (response.status === 404) {
    return { hasData: false };
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `CrUX Origin API error ${response.status}: ${errorBody.slice(0, 200)}`
    );
  }

  const data = await response.json();
  return { hasData: true, record: data.record };
}

/**
 * Extrai valores p75 e rating de um CrUXRecord
 * Para usar ao salvar no banco
 */
export function extractCruxP75(record: CrUXRecord) {
  const m = record.metrics;
  return {
    lcp: m.largest_contentful_paint?.percentiles.p75 ?? null,
    inp: m.interaction_to_next_paint?.percentiles.p75 ?? null,
    cls: m.cumulative_layout_shift?.percentiles.p75 ?? null,
    ttfb: m.experimental_time_to_first_byte?.percentiles.p75 ?? null,
    fcp: m.first_contentful_paint?.percentiles.p75 ?? null,
  };
}
