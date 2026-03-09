import { db, schema } from "@/lib/db";
import { fetchJsonWithRetry } from "./http";

type WikiSearchResponse = {
  query?: { search?: { title?: string }[] };
};

type WikiExtractResponse = {
  query?: {
    pages?: Record<
      string,
      { title?: string; fullurl?: string; extract?: string }
    >;
  };
};

export async function collectWikipediaEntity(params: {
  brandId: string;
  query: string;
}): Promise<{ upserted: boolean; title?: string }> {
  const q = params.query.trim();
  if (!q) return { upserted: false };

  // 1) Buscar melhor match
  const searchUrl =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=` +
    encodeURIComponent(q) +
    `&srlimit=1&origin=*`;

  const search = await fetchJsonWithRetry<WikiSearchResponse>(searchUrl, undefined, {
    retries: 2,
    backoffMs: 600,
    rateLimit: true,
  });

  const title = search.query?.search?.[0]?.title;
  if (!title) return { upserted: false };

  // 2) Buscar extract + URL
  const extractUrl =
    `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|info&exintro=1&explaintext=1&inprop=url&titles=` +
    encodeURIComponent(title) +
    `&origin=*`;

  const extract = await fetchJsonWithRetry<WikiExtractResponse>(extractUrl, undefined, {
    retries: 2,
    backoffMs: 600,
    rateLimit: true,
  });

  const page = extract.query?.pages
    ? Object.values(extract.query.pages)[0]
    : undefined;

  const url = String(page?.fullurl ?? "").trim();
  const cleanTitle = String(page?.title ?? title).trim();
  const text = page?.extract ? String(page.extract).slice(0, 5000) : null;

  if (!url || !cleanTitle) return { upserted: false };

  // Upsert por brandId (único)
  await db
    .insert(schema.brandEntities)
    .values({
      brandId: params.brandId,
      title: cleanTitle,
      url,
      extract: text,
    })
    .onConflictDoUpdate({
      target: schema.brandEntities.brandId,
      set: {
        title: cleanTitle,
        url,
        extract: text,
        createdAt: new Date(),
      },
    });

  return { upserted: true, title: cleanTitle };
}

