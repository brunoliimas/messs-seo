import { db, schema } from "@/lib/db";
import { fetchJsonWithRetry } from "./http";
import { normalizeRedditSearchJson } from "@/lib/normalizers/normalizeReddit";

export async function collectRedditMentions(params: {
  brandId: string;
  query: string;
  limit?: number;
  sort?: "new" | "relevance" | "hot" | "top";
}): Promise<{ inserted: number; query: string }> {
  const limit = params.limit ?? 25;
  const sort = params.sort ?? "new";
  const q = params.query.trim();
  if (!q) return { inserted: 0, query: q };

  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(
    q
  )}&limit=${limit}&sort=${sort}&restrict_sr=false`;

  const payload = await fetchJsonWithRetry<any>(
    url,
    {
      headers: {
        // Reddit bloqueia/limita requisições sem User-Agent identificável.
        "User-Agent": "MESSS-Digital-Audit-Dashboard/1.0 (+https://messs.com.br)",
      },
    },
    { retries: 2, backoffMs: 600, rateLimit: true }
  );

  const mentions = normalizeRedditSearchJson(payload);
  if (mentions.length === 0) return { inserted: 0, query: q };

  const rows = mentions.map((m) => ({
    brandId: params.brandId,
    title: m.title,
    subreddit: m.subreddit,
    url: m.url,
    score: m.score,
    numComments: m.numComments,
    createdAt: m.createdAt ?? new Date(),
  }));

  const result = await db
    .insert(schema.redditMentions)
    .values(rows)
    .onConflictDoNothing()
    .returning({ id: schema.redditMentions.id });

  return { inserted: result.length, query: q };
}

