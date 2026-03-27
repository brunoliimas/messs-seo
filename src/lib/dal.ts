// ============================================================================
// Data Access Layer (DAL)
// Queries Drizzle centralizadas — uma fonte de verdade para todos os dados
// Fallback automático para mock data quando DB não está conectado
// ============================================================================

import { eq, desc, and, sql, count } from "drizzle-orm";
import type { BrandSummary } from "@/types";
import type { TimelinePoint, MockSnapshot } from "./mock-data";
import type { Finding, Recommendation } from "./db/schema";

type MockFinding = Pick<Finding, "type" | "category" | "text" | "resolved">;
type MockRecommendation = Pick<
  Recommendation,
  "priority" | "category" | "text" | "timeline" | "status"
>;

// ── Check if DB is available ──
function hasDatabase(): boolean {
  return !!(
    process.env.DATABASE_URL &&
    process.env.DATABASE_URL !== "postgresql://..."
  );
}

// ── Log fallback uma vez por processo (evita poluir o console) ──
let dalFallbackLogged = false;
function logDalFallback(fn: string, error: unknown): void {
  if (dalFallbackLogged) return;
  dalFallbackLogged = true;
  const message =
    error instanceof Error ? error.message : String(error);
  const cause =
    error instanceof Error && error.cause instanceof Error
      ? error.cause.message
      : "";
  console.warn(
    "[DAL] Banco indisponível, usando dados mock. Defina DATABASE_URL e garanta que o Postgres está acessível para usar dados reais.",
    process.env.NODE_ENV === "development" ? `(${fn}: ${message}${cause ? ` — ${cause}` : ""})` : ""
  );
}

// ── Lazy import DB (avoids crash when env vars are missing) ──
async function getDb() {
  const { db, schema } = await import("./db");
  return { db, schema };
}

// ═══════════════════════════════════════════════
// GET ALL BRANDS (Overview page)
// ═══════════════════════════════════════════════

export async function getBrands(): Promise<BrandSummary[]> {
  if (!hasDatabase()) {
    const { MOCK_BRANDS } = await import("./mock-data");
    return MOCK_BRANDS;
  }

  try {
    const { db, schema } = await getDb();

    const brands = await db.query.brands.findMany({
      with: {
        audits: {
          orderBy: desc(schema.audits.date),
          limit: 1,
        },
        findings: true,
      },
    });

    return brands.map((brand) => {
      const audits = brand.audits ?? [];
      const findings = brand.findings ?? [];
      const latestAudit = audits[0];
      const criticalCount = findings.filter(
        (f) => f.type === "critical"
      ).length;
      const warningCount = findings.filter(
        (f) => f.type === "warning"
      ).length;
      const goodCount = findings.filter(
        (f) => f.type === "good"
      ).length;

      return {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        domain: brand.domain,
        platform: brand.platform ?? null,
        color: brand.color ?? null,
        gradient: brand.gradient ?? null,
        scores: {
          cwv: {
            letter: latestAudit?.cwvScore ?? "—",
            numeric: Number(latestAudit?.cwvNumeric) || 0,
          },
          seo: {
            letter: latestAudit?.seoScore ?? "—",
            numeric: Number(latestAudit?.seoNumeric) || 0,
          },
          aeo: {
            letter: latestAudit?.aeoScore ?? "—",
            numeric: Number(latestAudit?.aeoNumeric) || 0,
          },
          llm: {
            letter: latestAudit?.llmScore ?? "—",
            numeric: Number(latestAudit?.llmNumeric) || 0,
          },
        },
        findingCounts: {
          critical: criticalCount,
          warning: warningCount,
          good: goodCount,
        },
      };
    });
  } catch (error) {
    logDalFallback("getBrands", error);
    const { MOCK_BRANDS } = await import("./mock-data");
    return MOCK_BRANDS;
  }
}

// ═══════════════════════════════════════════════
// GET SINGLE BRAND (Detail page)
// ═══════════════════════════════════════════════

export async function getBrandBySlug(
  slug: string
): Promise<BrandSummary | undefined> {
  if (!hasDatabase()) {
    const { getMockBrand } = await import("./mock-data");
    return getMockBrand(slug);
  }

  try {
    const { db, schema } = await getDb();

    const brand = await db.query.brands.findFirst({
      where: eq(schema.brands.slug, slug),
      with: {
        audits: {
          orderBy: desc(schema.audits.date),
          limit: 1,
        },
        findings: true,
      },
    });

    if (!brand) return undefined;

    const audits = brand.audits ?? [];
    const findings = brand.findings ?? [];
    const latestAudit = audits[0];

    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      domain: brand.domain,
      platform: brand.platform ?? null,
      color: brand.color ?? null,
      gradient: brand.gradient ?? null,
      scores: {
        cwv: {
          letter: latestAudit?.cwvScore ?? "—",
          numeric: Number(latestAudit?.cwvNumeric) || 0,
        },
        seo: {
          letter: latestAudit?.seoScore ?? "—",
          numeric: Number(latestAudit?.seoNumeric) || 0,
        },
        aeo: {
          letter: latestAudit?.aeoScore ?? "—",
          numeric: Number(latestAudit?.aeoNumeric) || 0,
        },
        llm: {
          letter: latestAudit?.llmScore ?? "—",
          numeric: Number(latestAudit?.llmNumeric) || 0,
        },
      },
      findingCounts: {
        critical: findings.filter((f) => f.type === "critical").length,
        warning: findings.filter((f) => f.type === "warning").length,
        good: findings.filter((f) => f.type === "good").length,
      },
    };
  } catch (error) {
    logDalFallback("getBrandBySlug", error);
    const { getMockBrand } = await import("./mock-data");
    return getMockBrand(slug);
  }
}

// ═══════════════════════════════════════════════
// GET FINDINGS
// ═══════════════════════════════════════════════

export async function getFindings(
  brandSlug: string
): Promise<MockFinding[]> {
  if (!hasDatabase()) {
    const { getMockFindings } = await import("./mock-data");
    return getMockFindings(brandSlug);
  }

  try {
    const { db, schema } = await getDb();

    const brand = await db.query.brands.findFirst({
      where: eq(schema.brands.slug, brandSlug),
    });
    if (!brand) return [];

    const findings = await db.query.findings.findMany({
      where: eq(schema.findings.brandId, brand.id),
      orderBy: [
        sql`CASE 
          WHEN ${schema.findings.type} = 'critical' THEN 1 
          WHEN ${schema.findings.type} = 'warning' THEN 2 
          ELSE 3 
        END`,
      ],
    });

    return findings.map((f) => ({
      type: f.type as "critical" | "warning" | "good",
      category: f.category,
      text: f.text,
      resolved: f.resolved,
    }));
  } catch (error) {
    logDalFallback("getFindings", error);
    const { getMockFindings } = await import("./mock-data");
    return getMockFindings(brandSlug);
  }
}

// ═══════════════════════════════════════════════
// GET FINDINGS FOR ALL BRANDS (Compare page)
// ═══════════════════════════════════════════════

export async function getAllFindings(): Promise<
  Record<string, MockFinding[]>
> {
  if (!hasDatabase()) {
    const { MOCK_FINDINGS } = await import("./mock-data");
    return MOCK_FINDINGS;
  }

  try {
    const { db, schema } = await getDb();

    const brands = await db.query.brands.findMany();
    const result: Record<string, MockFinding[]> = {};

    for (const brand of brands) {
      const findings = await db.query.findings.findMany({
        where: eq(schema.findings.brandId, brand.id),
      });
      result[brand.slug] = findings.map((f) => ({
        type: f.type as "critical" | "warning" | "good",
        category: f.category,
        text: f.text,
        resolved: f.resolved,
      }));
    }

    return result;
  } catch (error) {
    logDalFallback("getAllFindings", error);
    const { MOCK_FINDINGS } = await import("./mock-data");
    return MOCK_FINDINGS;
  }
}

// ═══════════════════════════════════════════════
// GET RECOMMENDATIONS
// ═══════════════════════════════════════════════

export async function getRecommendations(
  brandSlug: string
): Promise<MockRecommendation[]> {
  if (!hasDatabase()) {
    const { getMockRecommendations } = await import("./mock-data");
    return getMockRecommendations(brandSlug);
  }

  try {
    const { db, schema } = await getDb();

    const brand = await db.query.brands.findFirst({
      where: eq(schema.brands.slug, brandSlug),
    });
    if (!brand) return [];

    // Mostra apenas recomendações da auditoria mais recente da marca,
    // evitando repetir itens históricos iguais na UI.
    const latestAudit = await db.query.audits.findFirst({
      where: eq(schema.audits.brandId, brand.id),
      orderBy: desc(schema.audits.date),
    });
    if (!latestAudit) return [];

    const recs = await db.query.recommendations.findMany({
      where: and(
        eq(schema.recommendations.brandId, brand.id),
        eq(schema.recommendations.auditId, latestAudit.id)
      ),
      orderBy: [
        sql`CASE 
          WHEN ${schema.recommendations.priority} = 'critical' THEN 1 
          WHEN ${schema.recommendations.priority} = 'high' THEN 2 
          WHEN ${schema.recommendations.priority} = 'medium' THEN 3 
          ELSE 4 
        END`,
      ],
    });

    const mapped = recs.map((r) => ({
      priority: r.priority as "critical" | "high" | "medium" | "low",
      category: r.category,
      text: r.text,
      timeline: r.timeline,
      status: r.status as "pending" | "in_progress" | "done" | "wont_fix",
    }));

    // Guarda adicional para dados legados: remove possíveis duplicados exatos.
    const seen = new Set<string>();
    return mapped.filter((r) => {
      const key = `${r.priority}|${r.category}|${r.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (error) {
    logDalFallback("getRecommendations", error);
    const { getMockRecommendations } = await import("./mock-data");
    return getMockRecommendations(brandSlug);
  }
}

// ═══════════════════════════════════════════════
// GET SNAPSHOTS
// ═══════════════════════════════════════════════

export async function getSnapshots(
  brandSlug: string
): Promise<MockSnapshot[]> {
  if (!hasDatabase()) {
    const { getMockSnapshots } = await import("./mock-data");
    return getMockSnapshots(brandSlug);
  }

  try {
    const { db, schema } = await getDb();

    const brand = await db.query.brands.findFirst({
      where: eq(schema.brands.slug, brandSlug),
    });
    if (!brand) return [];

    const snaps = await db.query.snapshots.findMany({
      where: eq(schema.snapshots.brandId, brand.id),
      orderBy: desc(schema.snapshots.date),
    });

    // Transform DB snapshots to MockSnapshot format
    return snaps.map((s) => {
      const metrics: Record<string, { value: number | null; rating: string | null }> = {};

      if (s.lcpValue !== null) metrics.lcp = { value: s.lcpValue, rating: s.lcpRating };
      if (s.inpValue !== null) metrics.inp = { value: s.inpValue, rating: s.inpRating };
      if (s.clsValue !== null) metrics.cls = { value: s.clsValue, rating: s.clsRating };
      if (s.ttfbValue !== null) metrics.ttfb = { value: s.ttfbValue, rating: s.ttfbRating };
      if (s.fcpValue !== null) metrics.fcp = { value: s.fcpValue, rating: s.fcpRating };

      return {
        source: s.source,
        strategy: s.strategy,
        isOrigin: s.isOrigin,
        date: s.date.toISOString().slice(0, 10),
        metrics,
        lighthouse:
          s.performanceScore !== null
            ? {
                performance: s.performanceScore,
                accessibility: s.accessibilityScore || 0,
                bestPractices: s.bestPracticesScore || 0,
                seo: s.seoScore || 0,
              }
            : undefined,
        labMetrics: {
          ...(s.tbtValue !== null ? { tbt: s.tbtValue } : {}),
          ...(s.speedIndex !== null ? { si: s.speedIndex } : {}),
          ...(s.ttiValue !== null ? { tti: s.ttiValue } : {}),
        },
      } as MockSnapshot;
    });
  } catch (error) {
    logDalFallback("getSnapshots", error);
    const { getMockSnapshots } = await import("./mock-data");
    return getMockSnapshots(brandSlug);
  }
}

// ═══════════════════════════════════════════════
// GET ALL SNAPSHOTS (Compare page)
// ═══════════════════════════════════════════════

export async function getAllSnapshots(): Promise<
  Record<string, MockSnapshot[]>
> {
  if (!hasDatabase()) {
    const { MOCK_SNAPSHOTS } = await import("./mock-data");
    return MOCK_SNAPSHOTS;
  }

  try {
    const { db, schema } = await getDb();
    const brands = await db.query.brands.findMany();
    const result: Record<string, MockSnapshot[]> = {};

    for (const brand of brands) {
      result[brand.slug] = await getSnapshots(brand.slug);
    }
    return result;
  } catch (error) {
    logDalFallback("getAllSnapshots", error);
    const { MOCK_SNAPSHOTS } = await import("./mock-data");
    return MOCK_SNAPSHOTS;
  }
}

// ═══════════════════════════════════════════════
// GET TIMELINE (History page)
// ═══════════════════════════════════════════════

export async function getTimeline(
  brandSlug: string
): Promise<TimelinePoint[]> {
  if (!hasDatabase()) {
    const { getMockTimeline } = await import("./mock-data");
    return getMockTimeline(brandSlug);
  }

  try {
    const { db, schema } = await getDb();

    const brand = await db.query.brands.findFirst({
      where: eq(schema.brands.slug, brandSlug),
    });
    if (!brand) return [];

    // Get all snapshots ordered by date
    const snaps = await db.query.snapshots.findMany({
      where: and(
        eq(schema.snapshots.brandId, brand.id),
        eq(schema.snapshots.isOrigin, false)
      ),
      orderBy: schema.snapshots.date,
    });

    // Group by month and build timeline points
    const byMonth = new Map<string, typeof snaps>();
    for (const snap of snaps) {
      const key = snap.date.toISOString().slice(0, 7); // "2026-02"
      if (!byMonth.has(key)) byMonth.set(key, []);
      byMonth.get(key)!.push(snap);
    }

    const months = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b));
    const monthLabels: Record<string, string> = {
      "01": "Jan",
      "02": "Fev",
      "03": "Mar",
      "04": "Abr",
      "05": "Mai",
      "06": "Jun",
      "07": "Jul",
      "08": "Ago",
      "09": "Set",
      "10": "Out",
      "11": "Nov",
      "12": "Dez",
    };

    return months.map(([monthKey, monthSnaps]) => {
      const [year, month] = monthKey.split("-");
      const label = `${monthLabels[month] || month}/${year.slice(2)}`;

      // Pick best available data (prefer CrUX mobile, fallback to lighthouse)
      const cruxMobile = monthSnaps.find(
        (s) => s.source === "crux" && s.strategy === "mobile"
      );
      const lighthouse = monthSnaps.find((s) => s.source === "lighthouse" || s.source === "pagespeed");

      const pick = cruxMobile || lighthouse;

      return {
        date: monthKey,
        label,
        lcp: pick?.lcpValue ?? null,
        inp: pick?.inpValue ?? null,
        cls: pick?.clsValue ?? null,
        ttfb: pick?.ttfbValue ?? null,
        fcp: pick?.fcpValue ?? null,
        tbt: pick?.tbtValue ?? lighthouse?.tbtValue ?? null,
        si: pick?.speedIndex ?? lighthouse?.speedIndex ?? null,
        tti: pick?.ttiValue ?? lighthouse?.ttiValue ?? null,
        performanceScore: lighthouse?.performanceScore ?? null,
        accessibilityScore: lighthouse?.accessibilityScore ?? null,
        seoScore: lighthouse?.seoScore ?? null,
      };
    });
  } catch (error) {
    logDalFallback("getTimeline", error);
    const { getMockTimeline } = await import("./mock-data");
    return getMockTimeline(brandSlug);
  }
}

// ═══════════════════════════════════════════════
// GET ALL TIMELINES (History compare mode)
// ═══════════════════════════════════════════════

export async function getAllTimelines(): Promise<
  { slug: string; name: string; color: string; data: TimelinePoint[] }[]
> {
  const brands = await getBrands();
  const result = [];

  for (const brand of brands) {
    const data = await getTimeline(brand.slug);
    result.push({
      slug: brand.slug,
      name: brand.name,
      color: brand.color || "#8021de",
      data,
    });
  }

  return result;
}
