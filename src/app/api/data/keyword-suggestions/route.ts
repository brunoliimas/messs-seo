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
  const keyword = searchParams.get("keyword");
  const limit = Number(searchParams.get("limit") ?? 20) || 20;
  if (!brandId) {
    return NextResponse.json({ error: "brandId is required" }, { status: 400 });
  }

  try {
    const rows = await db.query.keywordSuggestions.findMany({
      where: keyword
        ? and(
            eq(schema.keywordSuggestions.brandId, brandId),
            eq(schema.keywordSuggestions.keyword, keyword)
          )
        : eq(schema.keywordSuggestions.brandId, brandId),
      orderBy: desc(schema.keywordSuggestions.score),
      limit: Math.min(limit, 100),
    });
    return NextResponse.json({ brandId, keyword: keyword ?? null, items: rows });
  } catch {
    return NextResponse.json({ brandId, keyword: keyword ?? null, items: [] });
  }
}

