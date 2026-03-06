"use client";

import { useState } from "react";
import { FindingBadge } from "@/components/shared/FindingBadge";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Finding } from "@/lib/db/schema";

type MockFinding = Pick<Finding, "type" | "category" | "text" | "resolved">;

interface FindingsPanelProps {
  findings: MockFinding[];
  brandColor: string;
}

const categoryLabels: Record<string, string> = {
  cwv: "Core Web Vitals",
  seo: "SEO",
  aeo: "AEO",
  llm: "LLM Parsers",
  a11y: "Acessibilidade",
  performance: "Performance",
};

const typeOrder = ["critical", "warning", "good"] as const;

const typeConfig = {
  critical: { label: "Problemas Críticos", color: "var(--color-status-bad)" },
  warning: { label: "Pontos de Atenção", color: "var(--color-status-warn)" },
  good: { label: "Pontos Positivos", color: "var(--color-status-good)" },
};

export function FindingsPanel({ findings, brandColor }: FindingsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["critical", "warning", "good"])
  );

  function toggleSection(type: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  const grouped = typeOrder.map((type) => ({
    type,
    items: findings.filter((f) => f.type === type),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-heading-md text-base">Achados da Auditoria</h3>
        <span className="text-metric text-[10px] text-[var(--text-muted)]">
          {findings.length} ITENS
        </span>
      </div>

      {grouped.map(({ type, items }) => {
        if (items.length === 0) return null;
        const config = typeConfig[type];
        const isExpanded = expandedSections.has(type);

        return (
          <div key={type} className="card overflow-hidden">
            {/* Section header */}
            <button
              onClick={() => toggleSection(type)}
              className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-[var(--bg-surface-alt)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown size={16} style={{ color: config.color }} />
                ) : (
                  <ChevronRight size={16} style={{ color: config.color }} />
                )}
                <span
                  className="text-sm font-semibold"
                  style={{ color: config.color }}
                >
                  {config.label}
                </span>
                <span
                  className="text-metric text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                  }}
                >
                  {items.length}
                </span>
              </div>
            </button>

            {/* Items */}
            {isExpanded && (
              <div className="border-t border-[var(--border-subtle)]">
                {items.map((finding, i) => (
                  <div
                    key={i}
                    className={`px-5 py-4 ${
                      i < items.length - 1
                        ? "border-b border-[var(--border-subtle)]"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <FindingBadge type={type as any} label={categoryLabels[finding.category] || finding.category} />
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {finding.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
