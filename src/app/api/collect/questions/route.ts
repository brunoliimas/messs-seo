import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { collectAeoQuestions } from "@/lib/collectors/stackexchange";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requireCronAuth(request: NextRequest): Response | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  if (process.env.NODE_ENV === "development") return null;
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const auth = requireCronAuth(request);
  if (auth) return auth;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const brandId = String(body.brandId ?? "").trim();
  if (!brandId) {
    return NextResponse.json({ error: "brandId is required" }, { status: 400 });
  }

  const brand = await db.query.brands.findFirst({
    where: eq(schema.brands.id, brandId),
  });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const query = String(body.query ?? brand.name).trim();
  const pagesize = body.pagesize ? Number(body.pagesize) : undefined;
  const site = body.site ? String(body.site) : undefined;

  const result = await collectAeoQuestions({ brandId, query, pagesize, site });

  return NextResponse.json({
    ok: true,
    brandId,
    query,
    inserted: result.inserted,
  });
}

