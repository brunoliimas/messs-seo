"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { GlossaryTerm } from "@/lib/constants/glossary";

interface GlossarySearchProps {
  terms: GlossaryTerm[];
}

const categoryLabels: Record<string, string> = {
  performance: "Performance",
  seo: "SEO",
  aeo: "AEO",
  llm: "LLM",
  general: "Geral",
};

const categoryColors: Record<string, string> = {
  performance: "#f97316",
  seo: "#8021de",
  aeo: "#be12b3",
  llm: "#4124b2",
  general: "#71717a",
};

export function GlossarySearch({ terms }: GlossarySearchProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = terms.filter((term) => {
    const matchesQuery =
      query === "" ||
      term.term.toLowerCase().includes(query.toLowerCase()) ||
      term.full.toLowerCase().includes(query.toLowerCase()) ||
      term.desc.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = !activeCategory || term.category === activeCategory;

    return matchesQuery && matchesCategory;
  });

  const categories = [...new Set(terms.map((t) => t.category))];

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="text"
          placeholder="Buscar termos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-card)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-purple/40 transition-colors"
        />
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-[var(--radius-badge)] text-xs font-medium transition-colors cursor-pointer ${
            activeCategory === null
              ? "bg-purple/15 text-purple-light border border-purple/25"
              : "bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
          }`}
        >
          Todos ({terms.length})
        </button>
        {categories.map((cat) => {
          const count = terms.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(activeCategory === cat ? null : cat)
              }
              className={`px-3 py-1.5 rounded-[var(--radius-badge)] text-xs font-medium transition-colors cursor-pointer ${
                activeCategory === cat
                  ? "border"
                  : "bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
              }`}
              style={
                activeCategory === cat
                  ? {
                      backgroundColor: `${categoryColors[cat]}15`,
                      color: categoryColors[cat],
                      borderColor: `${categoryColors[cat]}40`,
                    }
                  : undefined
              }
            >
              {categoryLabels[cat]} ({count})
            </button>
          );
        })}
      </div>

      {/* Terms list */}
      <div className="space-y-3">
        {filtered.map((term) => (
          <div key={term.term} className="card p-5">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <span
                  className="text-metric-value text-lg"
                  style={{
                    color: categoryColors[term.category],
                    fontFamily: "var(--font-family-mono)",
                  }}
                >
                  {term.term}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  {term.full}
                </p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {term.desc}
                </p>
              </div>
              <span
                className="shrink-0 text-metric text-[9px] px-2 py-0.5 rounded-[var(--radius-badge)] border"
                style={{
                  color: categoryColors[term.category],
                  borderColor: `${categoryColors[term.category]}30`,
                  backgroundColor: `${categoryColors[term.category]}08`,
                }}
              >
                {categoryLabels[term.category]}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card p-8 text-center text-[var(--text-secondary)]">
            <p className="text-sm">
              Nenhum termo encontrado para &ldquo;{query}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
