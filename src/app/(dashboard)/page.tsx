import { SectionTitle } from "@/components/shared/SectionTitle";
import { BrandCard } from "./_components/BrandCard";
import { getBrands } from "@/lib/dal";

export default async function DashboardOverview() {
  const brands = await getBrands();

  const totalFindings = brands.reduce(
    (sum, b) => sum + b.findingCounts.critical + b.findingCounts.warning + b.findingCounts.good,
    0
  );
  const totalCritical = brands.reduce(
    (sum, b) => sum + b.findingCounts.critical,
    0
  );
  const criticalPct =
    totalFindings > 0 ? Math.round((totalCritical / totalFindings) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <SectionTitle
        title="Galderma Brasil"
        subtitle="AUDITORIA DIGITAL — MARÇO 2026"
      />

      {/* Brand cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "TOTAL FINDINGS", value: String(totalFindings), sublabel: `${brands.length} marcas` },
          { label: "CRITICAL", value: String(totalCritical), sublabel: `${criticalPct}%` },
          { label: "RECOMENDAÇÕES", value: "26", sublabel: "pendentes" },
          { label: "ÚLTIMA COLETA", value: "01/03", sublabel: "2026" },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-metric text-[10px] text-[var(--text-muted)] mb-1">
              {stat.label}
            </p>
            <p
              className="text-3xl font-mono"
              style={{ fontFamily: "var(--font-family-mono)" }}
            >
              {stat.value}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {stat.sublabel}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
