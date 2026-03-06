"use client";

import Link from "next/link";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { ExternalLink, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import type { BrandSummary } from "@/types";

interface BrandCardProps {
  brand: BrandSummary;
}

export function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link
      href={`/dashboard/${brand.slug}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] rounded-[var(--radius-card)]"
    >
      <div className="card p-0 transition-transform duration-[var(--transition-fast)] group-hover:scale-[1.02]">
        {/* Barra colorida no topo */}
        <div className="h-[3px]" style={{ background: brand.gradient || "var(--color-purple)" }} />

        <div className="p-6">
          {/* Header: nome + plataforma */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-heading-md text-lg">{brand.name}</h3>
              <p className="text-metric text-[10px] text-[var(--text-muted)] mt-0.5">
                {brand.domain}
              </p>
              {brand.platform && (
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {brand.platform}
                </p>
              )}
            </div>
            <ExternalLink
              size={14}
              className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Score rings */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <ScoreRing
              score={brand.scores.cwv.letter}
              label="CWV"
              color={brand.color || "#8021de"}
              size={80}
              strokeWidth={5}
            />
            <ScoreRing
              score={brand.scores.seo.letter}
              label="SEO"
              color={brand.color || "#8021de"}
              size={80}
              strokeWidth={5}
            />
            <ScoreRing
              score={brand.scores.aeo.letter}
              label="AEO"
              color={brand.color || "#8021de"}
              size={80}
              strokeWidth={5}
            />
            <ScoreRing
              score={brand.scores.llm.letter}
              label="LLM"
              color={brand.color || "#8021de"}
              size={80}
              strokeWidth={5}
            />
          </div>

          {/* Finding counts */}
          <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-status-bad" />
              <span className="text-metric text-[11px] text-status-bad">
                {brand.findingCounts.critical}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle size={13} className="text-status-warn" />
              <span className="text-metric text-[11px] text-status-warn">
                {brand.findingCounts.warning}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={13} className="text-status-good" />
              <span className="text-metric text-[11px] text-status-good">
                {brand.findingCounts.good}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
