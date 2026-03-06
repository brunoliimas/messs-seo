// ============================================================================
// Score & Rating utilities
// ============================================================================

import { LETTER_TO_NUMERIC } from "@/lib/db/schema";

/**
 * Converte score de letra para numérico
 * Ex: "B+" → 87, "D" → 63
 */
export function letterToNumeric(letter: string): number {
  return LETTER_TO_NUMERIC[letter] ?? 0;
}

/**
 * Converte score numérico para letra
 * Ex: 87 → "B+", 63 → "D"
 */
export function numericToLetter(value: number): string {
  if (value >= 97) return "A+";
  if (value >= 93) return "A";
  if (value >= 90) return "A-";
  if (value >= 87) return "B+";
  if (value >= 83) return "B";
  if (value >= 80) return "B-";
  if (value >= 77) return "C+";
  if (value >= 73) return "C";
  if (value >= 70) return "C-";
  if (value >= 67) return "D+";
  if (value >= 63) return "D";
  if (value >= 60) return "D-";
  return "F";
}

/**
 * Retorna a cor CSS para um score em letra
 */
export function getScoreColor(letter: string): string {
  const numeric = LETTER_TO_NUMERIC[letter] ?? 0;
  if (numeric >= 90) return "var(--color-status-good)";
  if (numeric >= 70) return "var(--color-status-warn)";
  if (numeric >= 60) return "var(--color-status-orange)";
  return "var(--color-status-bad)";
}

/**
 * Retorna a classe CSS do badge para um finding type
 */
export function getFindingBadgeClass(
  type: "critical" | "warning" | "good"
): string {
  switch (type) {
    case "critical":
      return "badge--bad";
    case "warning":
      return "badge--warn";
    case "good":
      return "badge--good";
  }
}

/**
 * Retorna a cor para uma priority de recomendação
 */
export function getPriorityColor(
  priority: "critical" | "high" | "medium" | "low"
): string {
  switch (priority) {
    case "critical":
      return "var(--color-status-bad)";
    case "high":
      return "var(--color-status-orange)";
    case "medium":
      return "var(--color-status-warn)";
    case "low":
      return "var(--color-status-good)";
  }
}

/**
 * Label legível para status de recomendação
 */
export function getStatusLabel(
  status: "pending" | "in_progress" | "done" | "wont_fix"
): string {
  switch (status) {
    case "pending":
      return "Pendente";
    case "in_progress":
      return "Em andamento";
    case "done":
      return "Concluído";
    case "wont_fix":
      return "Não aplicável";
  }
}
