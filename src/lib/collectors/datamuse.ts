import { db, schema } from "@/lib/db";
import { fetchJsonWithRetry } from "./http";

export interface DatamuseWord {
  word: string;
  score?: number;
  tags?: string[];
}

export async function collectKeywordSuggestions(params: {
  brandId: string;
  keyword: string;
  limit?: number;
}): Promise<{ inserted: number; keyword: string }> {
  const limit = params.limit ?? 40;
  const keyword = params.keyword.trim();
  if (!keyword) return { inserted: 0, keyword };

  const url = `https://api.datamuse.com/words?ml=${encodeURIComponent(
    keyword
  )}&max=${limit}`;

  const words = await fetchJsonWithRetry<DatamuseWord[]>(url, undefined, {
    retries: 2,
    backoffMs: 400,
    rateLimit: true,
  });

  const rows = words
    .filter((w) => w && typeof w.word === "string" && w.word.trim())
    .map((w) => ({
      brandId: params.brandId,
      keyword,
      suggestion: w.word.trim(),
      score: Number(w.score ?? 0) || 0,
    }));

  if (rows.length === 0) return { inserted: 0, keyword };

  const result = await db
    .insert(schema.keywordSuggestions)
    .values(rows)
    .onConflictDoNothing()
    .returning({ id: schema.keywordSuggestions.id });

  return { inserted: result.length, keyword };
}

