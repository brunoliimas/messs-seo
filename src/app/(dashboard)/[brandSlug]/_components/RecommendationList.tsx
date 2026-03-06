"use client";

import { useState } from "react";
import {
  Clock,
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
  Filter,
} from "lucide-react";
import { getPriorityColor, getStatusLabel } from "@/lib/utils/ratings";
import type { Recommendation } from "@/lib/db/schema";

type MockRecommendation = Pick<
  Recommendation,
  "priority" | "category" | "text" | "timeline" | "status"
>;

interface RecommendationListProps {
  recommendations: MockRecommendation[];
  brandColor: string;
}

const priorityConfig = {
  critical: { icon: AlertTriangle, label: "Crítica" },
  high: { icon: ArrowUp, label: "Alta" },
  medium: { icon: Minus, label: "Média" },
  low: { icon: ArrowDown, label: "Baixa" },
};

const categoryLabels: Record<string, string> = {
  cwv: "CWV",
  seo: "SEO",
  aeo: "AEO",
  llm: "LLM",
  a11y: "A11Y",
  performance: "PERF",
};

const statusColors: Record<string, string> = {
  pending: "var(--color-status-warn)",
  in_progress: "var(--color-purple)",
  done: "var(--color-status-good)",
  wont_fix: "var(--text-muted)",
};

export function RecommendationList({
  recommendations,
  brandColor,
}: RecommendationListProps) {
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  const filtered = filterPriority
    ? recommendations.filter((r) => r.priority === filterPriority)
    : recommendations;

  const priorityCounts = {
    critical: recommendations.filter((r) => r.priority === "critical").length,
    high: recommendations.filter((r) => r.priority === "high").length,
    medium: recommendations.filter((r) => r.priority === "medium").length,
    low: recommendations.filter((r) => r.priority === "low").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-heading-md text-base">Recomendações</h3>
          <span className="text-metric text-[10px] text-[var(--text-muted)]">
            {recommendations.length} ITENS
          </span>
        </div>

        {/* Priority filter pills */}
        <div className="flex items-center gap-1.5">
          <Filter size={12} className="text-[var(--text-muted)] mr-1" />
          {(["critical", "high", "medium", "low"] as const).map((p) => {
            const isActive = filterPriority === p;
            const color = getPriorityColor(p);
            const count = priorityCounts[p];
            if (count === 0) return null;

            return (
              <button
                key={p}
                onClick={() =>
                  setFilterPriority(isActive ? null : p)
                }
                className="px-2 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer"
                style={{
                  fontFamily: "var(--font-family-mono)",
                  backgroundColor: isActive ? `${color}20` : "transparent",
                  color: isActive ? color : "var(--text-muted)",
                  border: `1px solid ${isActive ? `${color}40` : "var(--border-subtle)"}`,
                }}
              >
                {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendation items */}
      <div className="space-y-2">
        {filtered.map((rec, i) => {
          const priority = rec.priority as keyof typeof priorityConfig;
          const config = priorityConfig[priority];
          const Icon = config.icon;
          const color = getPriorityColor(priority);
          const statusColor = statusColors[rec.status] || "var(--text-muted)";

          return (
            <div key={i} className="card p-0 overflow-hidden">
              {/* Priority color bar */}
              <div className="flex">
                <div
                  className="w-1 shrink-0"
                  style={{ backgroundColor: color }}
                />

                <div className="flex-1 px-4 py-3.5">
                  {/* Top row: priority + category + timeline */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="flex items-center gap-1 text-metric text-[10px]"
                      style={{ color }}
                    >
                      <Icon size={11} />
                      {config.label}
                    </span>

                    <span
                      className="text-metric text-[9px] px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${brandColor}15`,
                        color: brandColor,
                      }}
                    >
                      {categoryLabels[rec.category] || rec.category.toUpperCase()}
                    </span>

                    {rec.timeline && (
                      <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] ml-auto">
                        <Clock size={10} />
                        {rec.timeline}
                      </span>
                    )}
                  </div>

                  {/* Recommendation text */}
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {rec.text}
                  </p>

                  {/* Status */}
                  <div className="flex items-center gap-2 mt-2.5">
                    <span
                      className="text-metric text-[9px] px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${statusColor}12`,
                        color: statusColor,
                        border: `1px solid ${statusColor}25`,
                      }}
                    >
                      {getStatusLabel(rec.status as any)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card p-6 text-center text-[var(--text-muted)] text-sm">
          Nenhuma recomendação com essa prioridade.
        </div>
      )}
    </div>
  );
}
