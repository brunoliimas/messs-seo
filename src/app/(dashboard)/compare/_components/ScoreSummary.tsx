"use client";

import { ScoreRing } from "@/components/charts/ScoreRing";
import type { BrandSummary } from "@/types";

interface ScoreSummaryProps {
  brands: BrandSummary[];
}

const dimensions = [
  { key: "cwv", label: "CWV" },
  { key: "seo", label: "SEO" },
  { key: "aeo", label: "AEO" },
  { key: "llm", label: "LLM" },
] as const;

export function ScoreSummary({ brands }: ScoreSummaryProps) {
  return (
    <div className="card p-6">
      <p className="text-metric text-[10px] text-[var(--text-muted)] mb-5">
        SCORES POR MARCA
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {brands.map((brand) => (
          <div key={brand.slug} className="p-4 border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: brand.color || "#8021de" }}
              />
              <span className="text-sm font-semibold">{brand.name}</span>
            </div>

            <div className="flex items-center justify-between gap-1">
              {dimensions.map((dim) => {
                const score =
                  brand.scores[dim.key as keyof typeof brand.scores];
                return (
                  <ScoreRing
                    key={dim.key}
                    score={score.letter}
                    label={dim.label}
                    color={brand.color || "#8021de"}
                    size={68}
                    strokeWidth={4}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
