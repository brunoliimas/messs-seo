import { db, schema } from "@/lib/db";
import { fetchJsonWithRetry } from "./http";
import { normalizeStackExchangeSearch } from "@/lib/normalizers/normalizeStackexchange";

export async function collectAeoQuestions(params: {
  brandId: string;
  query: string;
  site?: string; // default: stackoverflow
  pagesize?: number;
}): Promise<{ inserted: number; query: string }> {
  const site = params.site ?? "stackoverflow";
  const pagesize = params.pagesize ?? 20;
  const q = params.query.trim();
  if (!q) return { inserted: 0, query: q };

  const url = `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&intitle=${encodeURIComponent(
    q
  )}&site=${encodeURIComponent(site)}&pagesize=${pagesize}`;

  const payload = await fetchJsonWithRetry<any>(url, undefined, {
    retries: 2,
    backoffMs: 600,
    rateLimit: true,
  });

  const questions = normalizeStackExchangeSearch(payload);
  if (questions.length === 0) return { inserted: 0, query: q };

  const rows = questions.map((it) => ({
    brandId: params.brandId,
    question: it.question,
    link: it.link,
    score: it.score,
    viewCount: it.viewCount,
    answerCount: it.answerCount,
    createdAt: it.createdAt ?? new Date(),
  }));

  const result = await db
    .insert(schema.aeoQuestions)
    .values(rows)
    .onConflictDoNothing()
    .returning({ id: schema.aeoQuestions.id });

  return { inserted: result.length, query: q };
}

