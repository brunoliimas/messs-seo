import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron semanal — coleta CrUX (dados de campo) de todas as marcas
 * Chamado pelo Vercel Cron toda segunda às 10:00 UTC
 * CrUX atualiza semanalmente, então mais de 1x/semana é redundante
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const brands = await db.query.brands.findMany();

    if (brands.length === 0) {
      return NextResponse.json({ message: "No brands found", collected: 0 });
    }

    const results: {
      brand: string;
      formFactor: string;
      status: "ok" | "no_data" | "error";
      error?: string;
    }[] = [];

    for (const brand of brands) {
      for (const formFactor of ["PHONE", "DESKTOP"] as const) {
        try {
          // TODO: Implementar coleta real na Fase 2
          // const data = await collectCrUX(
          //   `https://${brand.domain}`,
          //   formFactor
          // );
          //
          // if (!data.hasData) {
          //   results.push({ brand: brand.name, formFactor, status: "no_data" });
          //   continue;
          // }
          //
          // await db.insert(schema.snapshots).values({
          //   brandId: brand.id,
          //   source: 'crux',
          //   strategy: formFactor === 'PHONE' ? 'mobile' : 'desktop',
          //   url: `https://${brand.domain}`,
          //   ...extractCruxMetrics(data.record),
          // });

          results.push({ brand: brand.name, formFactor, status: "ok" });
        } catch (error) {
          results.push({
            brand: brand.name,
            formFactor,
            status: "error",
            error: String(error),
          });
        }

        // Rate limiting
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      collected: results.filter((r) => r.status === "ok").length,
      noData: results.filter((r) => r.status === "no_data").length,
      errors: results.filter((r) => r.status === "error").length,
      results,
    });
  } catch (error) {
    console.error("[CRON WEEKLY] Fatal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
