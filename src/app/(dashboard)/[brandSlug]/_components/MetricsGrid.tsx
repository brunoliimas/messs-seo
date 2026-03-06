"use client";

import { MetricCard } from "@/components/shared/MetricCard";
import { LighthouseBar } from "@/components/charts/LighthouseBar";
import { formatMs, formatCLS } from "@/lib/utils/formatters";
import { getRating, type Rating } from "@/lib/constants/thresholds";
import type { MockSnapshot } from "@/lib/mock-data";

interface MetricsGridProps {
  snapshots: MockSnapshot[];
  brandColor: string;
}

interface DisplayMetric {
  label: string;
  value: string;
  rating: Rating;
  sublabel: string;
}

function buildCruxMetrics(snapshot: MockSnapshot): DisplayMetric[] {
  const metrics: DisplayMetric[] = [];
  const entries = Object.entries(snapshot.metrics);

  for (const [key, data] of entries) {
    if (data.value === null) continue;

    const label = key.toUpperCase();
    const value = key === "cls" ? formatCLS(data.value) : formatMs(data.value);
    const rating = (data.rating as Rating) || getRating(data.value, key as any);
    const sublabel = data.rating === "good" ? "Aprovado" : data.rating === "needs-improvement" ? "Precisa melhorar" : "Reprovado";

    metrics.push({ label, value, rating, sublabel });
  }

  return metrics;
}

export function MetricsGrid({ snapshots, brandColor }: MetricsGridProps) {
  // Separate CrUX and Lighthouse snapshots
  const cruxSnapshots = snapshots.filter((s) => s.source === "crux");
  const lighthouseSnapshots = snapshots.filter((s) => s.source === "lighthouse");
  const hasCrux = cruxSnapshots.length > 0;
  const hasLighthouse = lighthouseSnapshots.length > 0;

  // Group CrUX by strategy + origin
  const cruxMobile = cruxSnapshots.find(
    (s) => s.strategy === "mobile" && !s.isOrigin
  );
  const cruxDesktop = cruxSnapshots.find(
    (s) => s.strategy === "desktop" && !s.isOrigin
  );
  const cruxOrigin = cruxSnapshots.find((s) => s.isOrigin);
  const lighthouse = lighthouseSnapshots[0];

  return (
    <div className="space-y-6">
      {/* ── CrUX Field Data ── */}
      {hasCrux && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-heading-md text-base">Dados de Campo (CrUX)</h3>
            <span className="text-metric text-[10px] text-[var(--text-muted)]">
              ÚLTIMOS 28 DIAS — DADOS REAIS DE USUÁRIOS
            </span>
          </div>

          {/* Mobile */}
          {cruxMobile && (
            <div>
              <p className="text-metric text-[10px] text-[var(--text-muted)] mb-3">
                MOBILE
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {buildCruxMetrics(cruxMobile).map((m) => (
                  <MetricCard
                    key={m.label}
                    label={m.label}
                    value={m.value}
                    rating={m.rating}
                    sublabel={m.sublabel}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {/* Desktop */}
          {cruxDesktop && (
            <div>
              <p className="text-metric text-[10px] text-[var(--text-muted)] mb-3">
                DESKTOP (URL)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {buildCruxMetrics(cruxDesktop).map((m) => (
                  <MetricCard
                    key={m.label}
                    label={m.label}
                    value={m.value}
                    rating={m.rating}
                    sublabel={m.sublabel}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {/* Origin (if different from URL) */}
          {cruxOrigin && (
            <div>
              <p className="text-metric text-[10px] text-[var(--text-muted)] mb-3">
                DESKTOP (ORIGIN — DOMÍNIO INTEIRO)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {buildCruxMetrics(cruxOrigin).map((m) => (
                  <MetricCard
                    key={m.label}
                    label={m.label}
                    value={m.value}
                    rating={m.rating}
                    sublabel={m.sublabel}
                    compact
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── No CrUX data warning ── */}
      {!hasCrux && (
        <div className="card p-5 border-status-warn/20">
          <div className="flex items-start gap-3">
            <span className="text-metric text-[11px] text-status-warn">
              SEM DADOS CRUX
            </span>
            <p className="text-sm text-[var(--text-secondary)]">
              Tráfego insuficiente para o Chrome User Experience Report (&lt;1.000
              visitas/mês). Métricas abaixo são lab data (Lighthouse) — simuladas,
              não de usuários reais.
            </p>
          </div>
        </div>
      )}

      {/* ── Lighthouse Lab Data ── */}
      {hasLighthouse && lighthouse && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-heading-md text-base">
              Lighthouse (Lab Data)
            </h3>
            <span className="text-metric text-[10px] text-[var(--text-muted)]">
              {lighthouse.strategy.toUpperCase()} — {lighthouse.date}
            </span>
          </div>

          {/* Lighthouse category scores */}
          {lighthouse.lighthouse && (
            <div className="card p-5 space-y-4">
              <LighthouseBar
                label="Performance"
                score={lighthouse.lighthouse.performance}
              />
              <LighthouseBar
                label="Acessibilidade"
                score={lighthouse.lighthouse.accessibility}
              />
              <LighthouseBar
                label="Boas Práticas"
                score={lighthouse.lighthouse.bestPractices}
              />
              <LighthouseBar
                label="SEO"
                score={lighthouse.lighthouse.seo}
              />
            </div>
          )}

          {/* Lab metrics */}
          <div>
            <p className="text-metric text-[10px] text-[var(--text-muted)] mb-3">
              MÉTRICAS DE LABORATÓRIO
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(lighthouse.metrics).map(([key, data]) => {
                if (data.value === null) return null;
                const label = key.toUpperCase();
                const value =
                  key === "cls" ? formatCLS(data.value) : formatMs(data.value);
                const rating = (data.rating as Rating) || "good";
                return (
                  <MetricCard
                    key={label}
                    label={label}
                    value={value}
                    rating={rating}
                    compact
                  />
                );
              })}
              {/* Additional lab-only metrics */}
              {lighthouse.labMetrics &&
                Object.entries(lighthouse.labMetrics).map(([key, val]) => (
                  <MetricCard
                    key={key}
                    label={key.toUpperCase()}
                    value={formatMs(val)}
                    rating={getRating(val, key as any)}
                    compact
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
