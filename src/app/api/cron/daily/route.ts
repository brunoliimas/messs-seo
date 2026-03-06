import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron diário — coleta Lighthouse/PageSpeed de todas as marcas
 * Chamado pelo Vercel Cron às 09:00 UTC
 * Também pode ser chamado manualmente via /admin/collect
 */
export async function GET(request: NextRequest) {
  // ── Verificar autenticação do cron ──
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Buscar todas as marcas ativas
    const brands = await db.query.brands.findMany();

    if (brands.length === 0) {
      return NextResponse.json({ message: "No brands found", collected: 0 });
    }

    const results: {
      brand: string;
      strategy: string;
      status: "ok" | "error";
      error?: string;
    }[] = [];

    for (const brand of brands) {
      for (const strategy of ["mobile", "desktop"] as const) {
        try {
          // TODO: Implementar coleta real na Fase 2
          // const data = await collectPageSpeed({
          //   url: `https://${brand.domain}`,
          //   strategy,
          //   categories: ['performance', 'accessibility', 'best-practices', 'seo'],
          // });
          //
          // await db.insert(schema.snapshots).values({
          //   brandId: brand.id,
          //   source: 'pagespeed',
          //   strategy,
          //   url: `https://${brand.domain}`,
          //   performanceScore: data.lighthouse.performance,
          //   ...
          // });

          results.push({ brand: brand.name, strategy, status: "ok" });
        } catch (error) {
          results.push({
            brand: brand.name,
            strategy,
            status: "error",
            error: String(error),
          });
        }

        // Rate limiting — 1.5s entre chamadas
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      collected: results.filter((r) => r.status === "ok").length,
      errors: results.filter((r) => r.status === "error").length,
      results,
    });
  } catch (error) {
    console.error("[CRON DAILY] Fatal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
