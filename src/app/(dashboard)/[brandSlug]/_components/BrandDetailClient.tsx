"use client";

import { useState } from "react";
import { ScoresOverview } from "./ScoresOverview";
import { MetricsGrid } from "./MetricsGrid";
import { FindingsPanel } from "./FindingsPanel";
import { RecommendationList } from "./RecommendationList";
import { BrandNav } from "./BrandNav";
import type { BrandSummary } from "@/types";
import type { MockSnapshot } from "@/lib/mock-data";
import type { Finding, Recommendation } from "@/lib/db/schema";

type MockFinding = Pick<Finding, "type" | "category" | "text" | "resolved">;
type MockRecommendation = Pick<
  Recommendation,
  "priority" | "category" | "text" | "timeline" | "status"
>;

interface BrandDetailClientProps {
  brand: BrandSummary;
  snapshots: MockSnapshot[];
  findings: MockFinding[];
  recommendations: MockRecommendation[];
}

export function BrandDetailClient({
  brand,
  snapshots,
  findings,
  recommendations,
}: BrandDetailClientProps) {
  const [activeSection, setActiveSection] = useState("metrics");
  const brandColor = brand.color || "#8021de";

  return (
    <div className="space-y-6">
      {/* Scores overview - always visible */}
      <ScoresOverview brand={brand} />

      {/* Navigation tabs */}
      <BrandNav
        brandSlug={brand.slug}
        brandColor={brandColor}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Section content */}
      <div className="animate-fade-in" key={activeSection}>
        {activeSection === "metrics" && (
          <MetricsGrid snapshots={snapshots} brandColor={brandColor} />
        )}
        {activeSection === "findings" && (
          <FindingsPanel findings={findings} brandColor={brandColor} />
        )}
        {activeSection === "recommendations" && (
          <RecommendationList
            recommendations={recommendations}
            brandColor={brandColor}
          />
        )}
      </div>
    </div>
  );
}
