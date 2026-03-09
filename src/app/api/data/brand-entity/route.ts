import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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
  if (!brandId) {
    return NextResponse.json({ error: "brandId is required" }, { status: 400 });
  }

  try {
    const entity = await db.query.brandEntities.findFirst({
      where: eq(schema.brandEntities.brandId, brandId),
    });
    return NextResponse.json({ brandId, entity: entity ?? null });
  } catch {
    return NextResponse.json({ brandId, entity: null });
  }
}

