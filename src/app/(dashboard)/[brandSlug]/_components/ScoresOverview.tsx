"use client";

import { ScoreRing } from "@/components/charts/ScoreRing";
import { ExternalLink, Globe, Server } from "lucide-react";
import type { BrandSummary } from "@/types";

interface ScoresOverviewProps {
  brand: BrandSummary;
}

export function ScoresOverview({ brand }: ScoresOverviewProps) {
  const scoreEntries = [
    { key: "cwv", label: "Core Web Vitals", data: brand.scores.cwv },
    { key: "seo", label: "SEO", data: brand.scores.seo },
    { key: "aeo", label: "AEO", data: brand.scores.aeo },
    { key: "llm", label: "LLM Parsers", data: brand.scores.llm },
  ];

  return (
    <div className="card p-0">
      <div
        className="h-[3px]"
        style={{ background: brand.gradient || "var(--color-purple)" }}
      />

      <div className="p-6">
        {/* Brand header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-heading-lg text-2xl">{brand.name}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <Globe size={14} />
                {brand.domain}
              </span>
              {brand.platform && (
                <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                  <Server size={14} />
                  {brand.platform}
                </span>
              )}
            </div>
          </div>
          <a
            href={`https://${brand.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-purple-light transition-colors"
          >
            Visitar site
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Score rings row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {scoreEntries.map(({ key, label, data }) => (
            <div key={key} className="flex flex-col items-center">
              <ScoreRing
                score={data.letter}
                label={label}
                color={brand.color || "#8021de"}
                size={110}
                strokeWidth={6}
              />
            </div>
          ))}
        </div>

        {/* Audit info */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[var(--border-subtle)]">
          <span className="text-metric text-[10px] text-[var(--text-muted)]">
            AUDITORIA COMPLETA — MARÇO 2026
          </span>
        </div>
      </div>
    </div>
  );
}
