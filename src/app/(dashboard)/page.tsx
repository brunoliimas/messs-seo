import { BrandCard } from "./_components/BrandCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import type { RecentActivityItem } from "@/components/dashboard/RecentActivityTable";
import { CompareRadar } from "@/components/charts/CompareRadar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBrands, getAllFindings } from "@/lib/dal";
import { BarChart3, Activity, Layers } from "lucide-react";

export default async function DashboardOverview() {
  const [brands, findingsBySlug] = await Promise.all([
    getBrands(),
    getAllFindings(),
  ]);

  const totalFindings = brands.reduce(
    (sum, b) =>
      sum +
      b.findingCounts.critical +
      b.findingCounts.warning +
      b.findingCounts.good,
    0
  );
  const totalCritical = brands.reduce(
    (sum, b) => sum + b.findingCounts.critical,
    0
  );
  const criticalPct =
    totalFindings > 0
      ? Math.round((totalCritical / totalFindings) * 100)
      : 0;

  const activityItems: RecentActivityItem[] = [];
  for (const brand of brands) {
    const findings = findingsBySlug[brand.slug] || [];
    for (const f of findings.slice(0, 4)) {
      activityItems.push({
        brandName: brand.name,
        description: f.text,
        type: f.type as "critical" | "warning" | "good",
      });
    }
  }
  const recentActivity = activityItems.slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Page title — hierarquia clara */}
      <header className="mb-2">
        <h2 className="text-heading-lg text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          Galderma Brasil
        </h2>
        <p className="text-metric text-[11px] text-[var(--text-muted)] mt-1.5 uppercase tracking-wider">
          Auditoria digital — março 2026
        </p>
      </header>

      {/* Row 1: Key metrics */}
      <section aria-labelledby="metrics-heading">
        <h3 id="metrics-heading" className="sr-only">
          Indicadores principais
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-6">
          <StatsCard
            label="TOTAL FINDINGS"
            value={String(totalFindings)}
            sublabel={`${brands.length} marcas`}
          />
          <StatsCard
            label="CRITICAL"
            value={String(totalCritical)}
            sublabel={`${criticalPct}%`}
          />
          <StatsCard
            label="RECOMENDAÇÕES"
            value="26"
            sublabel="pendentes"
          />
          <StatsCard
            label="ÚLTIMA COLETA"
            value="01/03"
            sublabel="2026"
          />
        </div>
      </section>

      {/* Row 2: Charts */}
      <section aria-labelledby="charts-heading">
        <Card className="border-[var(--border-subtle)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
          <CardHeader className="border-b border-[var(--border-subtle)] px-8 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="size-5 text-[var(--text-muted)]" aria-hidden />
              <div>
                <CardTitle className="text-heading-md text-xl">Métricas</CardTitle>
                <p className="text-metric text-[11px] text-[var(--text-muted)] mt-1">
                  CWV, SEO, AEO, LLM — comparativo por marca
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CompareRadar brands={brands} />
              <Card className="border-[var(--border-subtle)] rounded-[var(--radius-card)]">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[320px]">
                  <p className="text-metric text-[10px] text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                    Evolução temporal
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] text-center">
                    Acesse uma marca para ver a timeline de métricas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Row 3: Insights / Marcas */}
      <section aria-labelledby="brands-heading">
        <Card className="border-[var(--border-subtle)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
          <CardHeader className="border-b border-[var(--border-subtle)] px-8 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <Layers className="size-5 text-[var(--text-muted)]" aria-hidden />
              <div>
                <CardTitle className="text-heading-md text-xl">Marcas</CardTitle>
                <p className="text-metric text-[11px] text-[var(--text-muted)] mt-1">
                  Clique em uma marca para detalhes da auditoria
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {brands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Row 4: Data table */}
      <section aria-labelledby="activity-heading">
        <Card className="border-[var(--border-subtle)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
          <CardHeader className="border-b border-[var(--border-subtle)] px-8 pt-8 pb-6">
            <div className="flex items-center gap-3">
              <Activity className="size-5 text-[var(--text-muted)]" aria-hidden />
              <div>
                <CardTitle className="text-heading-md text-xl">Atividade recente</CardTitle>
                <p className="text-metric text-[11px] text-[var(--text-muted)] mt-1">
                  Últimos achados por marca
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <RecentActivityTable items={recentActivity} embedded />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
