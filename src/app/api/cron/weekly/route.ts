import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collectAeoQuestions } from "@/lib/collectors/stackexchange";
import { collectWikipediaEntity } from "@/lib/collectors/wikipedia";
import { collectSearchConsoleDay } from "@/lib/collectors/searchConsole";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron semanal
 * Chamado pelo Vercel Cron toda segunda às 10:00 UTC
 *
 * Weekly:
 * - Search Console (últimos 7 dias, por dia)
 * - StackExchange (AEO questions)
 * - Wikipedia entity check
 *
 * (CrUX permanece para Fase 2)
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
      job: "search-console" | "questions" | "entities" | "crux";
      status: "ok" | "error";
      inserted?: number;
      error?: string;
      date?: string;
    }[] = [];

    for (const brand of brands) {
      // Search Console: últimos 7 dias completos (ontem → 7 dias atrás)
      for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() - i);
        try {
          const r = await collectSearchConsoleDay({
            brandId: brand.id,
            siteUrl: `sc-domain:${brand.domain}`,
            date,
            rowLimit: 250,
          });
          results.push({
            brand: brand.name,
            job: "search-console",
            status: "ok",
            inserted: r.inserted,
            date: r.date,
          });
        } catch (error) {
          results.push({
            brand: brand.name,
            job: "search-console",
            status: "error",
            error: String(error),
            date: date.toISOString().slice(0, 10),
          });
        }
      }

      // StackExchange (AEO)
      try {
        const q = await collectAeoQuestions({
          brandId: brand.id,
          query: brand.name,
          pagesize: 20,
          site: "stackoverflow",
        });
        results.push({
          brand: brand.name,
          job: "questions",
          status: "ok",
          inserted: q.inserted,
        });
      } catch (error) {
        results.push({
          brand: brand.name,
          job: "questions",
          status: "error",
          error: String(error),
        });
      }

      // Wikipedia entity
      try {
        const e = await collectWikipediaEntity({
          brandId: brand.id,
          query: brand.name,
        });
        results.push({
          brand: brand.name,
          job: "entities",
          status: "ok",
          inserted: e.upserted ? 1 : 0,
        });
      } catch (error) {
        results.push({
          brand: brand.name,
          job: "entities",
          status: "error",
          error: String(error),
        });
      }

      // CrUX permanece como placeholder
      results.push({
        brand: brand.name,
        job: "crux",
        status: "ok",
        inserted: 0,
      });
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      collected: results.filter((r) => r.status === "ok").length,
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
