export interface NormalizedSearchConsoleRow {
  date: Date;
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

// GSC Search Analytics API: rows[] com keys[] e metrics
// Dimensões podem variar (query/page). Aqui normalizamos para sempre ter query+page (strings).
export function normalizeSearchConsoleRows(payload: any, date: Date): NormalizedSearchConsoleRow[] {
  const rows = payload?.rows;
  if (!Array.isArray(rows)) return [];

  return rows.map((r: any) => {
    const keys: unknown[] = Array.isArray(r.keys) ? r.keys : [];
    const query = typeof keys[0] === "string" ? keys[0] : "";
    const page = typeof keys[1] === "string" ? keys[1] : "";

    return {
      date,
      query,
      page,
      clicks: Number(r.clicks ?? 0) || 0,
      impressions: Number(r.impressions ?? 0) || 0,
      ctr: Number(r.ctr ?? 0) || 0,
      position: Number(r.position ?? 0) || 0,
    };
  });
}

