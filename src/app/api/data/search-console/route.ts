import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const brandId = String(searchParams.get("brandId") ?? "").trim();
  const limit = Number(searchParams.get("limit") ?? 50) || 50;
  const dateParam = searchParams.get("date"); // YYYY-MM-DD opcional

  if (!brandId) {
    return NextResponse.json({ error: "brandId is required" }, { status: 400 });
  }

  try {
    let date: string | null = dateParam ? String(dateParam) : null;

    if (!date) {
      const latest = await db.query.searchConsoleSnapshots.findMany({
        where: eq(schema.searchConsoleSnapshots.brandId, brandId),
        orderBy: desc(schema.searchConsoleSnapshots.date),
        limit: 1,
      });
      const d = latest[0]?.date;
      date = d ? d.toISOString().slice(0, 10) : null;
    }

    if (!date) {
      return NextResponse.json({
        brandId,
        date: null,
        totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
        rows: [],
      });
    }

    const day = new Date(date);

    const rows = await db.query.searchConsoleSnapshots.findMany({
      where: and(
        eq(schema.searchConsoleSnapshots.brandId, brandId),
        eq(schema.searchConsoleSnapshots.date, day)
      ),
      orderBy: desc(schema.searchConsoleSnapshots.clicks),
      limit: Math.min(limit, 250),
    });

    const totals = rows.reduce(
      (acc, r) => {
        acc.clicks += r.clicks ?? 0;
        acc.impressions += r.impressions ?? 0;
        return acc;
      },
      { clicks: 0, impressions: 0 }
    );

    const ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
    const avgPosition =
      rows.length > 0
        ? rows.reduce((s, r) => s + (r.position ?? 0), 0) / rows.length
        : 0;

    return NextResponse.json({
      brandId,
      date,
      totals: {
        clicks: totals.clicks,
        impressions: totals.impressions,
        ctr,
        position: avgPosition,
      },
      rows,
    });
  } catch {
    return NextResponse.json({
      brandId,
      date: null,
      totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      rows: [],
    });
  }
}

