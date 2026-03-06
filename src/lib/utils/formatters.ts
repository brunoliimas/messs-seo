// ============================================================================
// Formatação de métricas para exibição no dashboard
// ============================================================================

/**
 * Formata milissegundos para exibição legível
 * Ex: 2500 → "2.5s", 145 → "145ms"
 */
export function formatMs(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${Math.round(ms)}ms`;
}

/**
 * Formata CLS (não tem unidade)
 * Ex: 0.05 → "0.05", 0.182 → "0.18"
 */
export function formatCLS(value: number): string {
  return value.toFixed(2);
}

/**
 * Formata bytes para exibição legível
 * Ex: 1003000 → "980KB", 2500000 → "2.4MB"
 */
export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(1)}MB`;
  }
  if (bytes >= 1_000) {
    return `${Math.round(bytes / 1_000)}KB`;
  }
  return `${bytes}B`;
}

/**
 * Formata score Lighthouse (0-100)
 * Ex: 63 → "63", 92.5 → "93"
 */
export function formatLighthouseScore(score: number): string {
  return Math.round(score).toString();
}

/**
 * Formata valor de métrica genérico baseado no tipo
 */
export function formatMetricValue(
  value: number,
  metric: string
): string {
  if (metric === "cls") return formatCLS(value);
  return formatMs(value);
}

/**
 * Formata data para exibição brasileira
 * Ex: "2026-03-01" → "01/03/2026"
 */
export function formatDateBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formata data para label de gráfico
 * Ex: "2026-03-01" → "Mar/26"
 */
export function formatDateChart(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
}

/**
 * Formata porcentagem de distribuição CrUX
 * Ex: 0.756 → "75.6%"
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
