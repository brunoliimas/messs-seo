"use client";

import Link from "next/link";
import { BarChart3, Clock } from "lucide-react";

interface BrandNavProps {
  brandSlug: string;
  brandColor: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: "metrics", label: "Métricas" },
  { id: "findings", label: "Achados" },
  { id: "recommendations", label: "Recomendações" },
];

export function BrandNav({
  brandSlug,
  brandColor,
  activeSection,
  onSectionChange,
}: BrandNavProps) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-1">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className="relative px-4 py-3 text-sm font-medium transition-colors cursor-pointer"
              style={{
                color: isActive
                  ? brandColor
                  : "var(--text-secondary)",
              }}
            >
              {section.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: brandColor }}
                />
              )}
            </button>
          );
        })}
      </div>

      <Link
        href={`/dashboard/${brandSlug}/history`}
        className="flex items-center gap-1.5 px-3 py-2 text-xs text-[var(--text-muted)] hover:text-purple-light transition-colors rounded-[var(--radius-button)] hover:bg-[var(--bg-surface-alt)]"
      >
        <Clock size={13} />
        Evolução Temporal
        <BarChart3 size={13} />
      </Link>
    </div>
  );
}
