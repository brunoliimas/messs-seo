"use client";

import { AlertTriangle } from "lucide-react";
import type { BrandSummary } from "@/types";
import type { Finding } from "@/lib/db/schema";

type MockFinding = Pick<Finding, "type" | "category" | "text" | "resolved">;

interface BiggestProblemProps {
  brands: BrandSummary[];
  findings: Record<string, MockFinding[]>;
}

const categoryLabels: Record<string, string> = {
  cwv: "Core Web Vitals",
  seo: "SEO",
  aeo: "AEO",
  llm: "LLM Parsers",
  a11y: "Acessibilidade",
  performance: "Performance",
};

export function BiggestProblem({ brands, findings }: BiggestProblemProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-heading-md text-base">Maior Problema por Marca</h3>
        <span className="text-metric text-[10px] text-[var(--text-muted)]">
          PRIORIDADE #1
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {brands.map((brand) => {
          const brandFindings = findings[brand.slug] || [];
          const critical = brandFindings.find((f) => f.type === "critical");

          return (
            <div key={brand.slug} className="card p-0 overflow-hidden">
              <div
                className="h-[3px]"
                style={{
                  background: brand.gradient || "var(--color-purple)",
                }}
              />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: brand.color || "#8021de" }}
                  />
                  <span className="text-sm font-semibold">
                    {brand.name}
                  </span>
                </div>

                {critical ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        size={13}
                        className="text-status-bad shrink-0"
                      />
                      <span className="text-metric text-[10px] text-status-bad">
                        {categoryLabels[critical.category] ||
                          critical.category.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-4">
                      {critical.text}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">
                    Nenhum problema crítico encontrado.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
