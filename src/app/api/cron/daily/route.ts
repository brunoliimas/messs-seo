import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collectRedditMentions } from "@/lib/collectors/reddit";
import { collectKeywordSuggestions } from "@/lib/collectors/datamuse";
import { persistPageSpeedBothStrategies } from "@/lib/collectors/persistPageSpeed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron diário
 * Chamado pelo Vercel Cron às 09:00 UTC
 *
 * Daily:
 * - Reddit mentions
 * - Keyword discovery (Datamuse)
 * - PageSpeed Insights (Lighthouse) — mobile + desktop por marca
 */
export async function GET(request: NextRequest) {
  // ── Verificar autenticação do cron ──
  const authHeader = request.headers.get("authorization")?.trim();
  const secret = process.env.CRON_SECRET?.trim();
  const expected = secret ? `Bearer ${secret}` : null;

  if (!expected || authHeader !== expected) {
    const receivedToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader ?? "";
    return NextResponse.json(
      {
        error: "Unauthorized",
        debug: {
          cronSecretSet: !!secret,
          authHeaderPresent: !!authHeader,
          secretLength: secret?.length ?? 0,
          receivedTokenLength: receivedToken.length,
          hint: !secret
            ? "CRON_SECRET não está definido. Adicione no .env.local e reinicie o servidor."
            : !authHeader
              ? "Header Authorization ausente. Use: -H \"Authorization: Bearer SEU_CRON_SECRET\""
              : "Valor do Bearer não confere com CRON_SECRET. Confira espaços e aspas no .env.local.",
        },
      },
      { status: 401 }
    );
  }

  try {
    // Buscar todas as marcas ativas
    const brands = await db.query.brands.findMany();

    if (brands.length === 0) {
      return NextResponse.json({ message: "No brands found", collected: 0 });
    }

    const results: {
      brand: string;
      job: "reddit" | "keywords" | "pagespeed";
      status: "ok" | "error";
      inserted?: number;
      error?: string;
    }[] = [];

    for (const brand of brands) {
      // Reddit
      try {
        const r = await collectRedditMentions({
          brandId: brand.id,
          query: brand.name,
          limit: 25,
          sort: "new",
        });
        results.push({
          brand: brand.name,
          job: "reddit",
          status: "ok",
          inserted: r.inserted,
        });
      } catch (error) {
        results.push({
          brand: brand.name,
          job: "reddit",
          status: "error",
          error: String(error),
        });
      }

      // Datamuse (keywords relacionadas)
      try {
        const k = await collectKeywordSuggestions({
          brandId: brand.id,
          keyword: brand.name,
          limit: 40,
        });
        results.push({
          brand: brand.name,
          job: "keywords",
          status: "ok",
          inserted: k.inserted,
        });
      } catch (error) {
        results.push({
          brand: brand.name,
          job: "keywords",
          status: "error",
          error: String(error),
        });
      }

      // PageSpeed Insights (Lighthouse) — mobile + desktop
      try {
        const p = await persistPageSpeedBothStrategies({
          brandId: brand.id,
          url: `https://${brand.domain}`,
        });
        results.push({
          brand: brand.name,
          job: "pagespeed",
          status: "ok",
          inserted: p.inserted,
        });
      } catch (error) {
        results.push({
          brand: brand.name,
          job: "pagespeed",
          status: "error",
          error: String(error),
        });
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
