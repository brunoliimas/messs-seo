import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/collect
 * Trigger manual de coleta — chamado pelo admin via dashboard
 * Requer autenticação de user com role admin ou analyst
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar auth via Supabase
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Verificar role do user (admin ou analyst)
    // const profile = await db.query.profiles.findFirst({
    //   where: eq(schema.profiles.id, user.id),
    // });
    // if (!profile || !['admin', 'analyst'].includes(profile.role)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const body = await request.json();
    const { brandSlug, strategy } = body;

    // TODO: Implementar coleta real na Fase 2
    // const brand = await db.query.brands.findFirst({
    //   where: eq(schema.brands.slug, brandSlug),
    // });
    // if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    //
    // const data = await collectPageSpeed({
    //   url: `https://${brand.domain}`,
    //   strategy: strategy || 'mobile',
    //   categories: ['performance', 'accessibility', 'best-practices', 'seo'],
    // });

    return NextResponse.json({
      message: "Coleta manual — implementar na Fase 2",
      brandSlug,
      strategy,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[COLLECT] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
