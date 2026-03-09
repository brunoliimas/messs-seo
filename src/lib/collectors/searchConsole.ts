import { JWT } from "google-auth-library";
import { db, schema } from "@/lib/db";
import { fetchJsonWithRetry } from "./http";
import { normalizeSearchConsoleRows } from "@/lib/normalizers/normalizeSearchConsole";

type GscQueryResponse = {
  rows?: Array<{
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }>;
};

let jwtClient: JWT | null = null;

function getJwtClient(): JWT {
  if (jwtClient) return jwtClient;

  const email = process.env.GSC_SERVICE_ACCOUNT_EMAIL;
  const keyRaw = process.env.GSC_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !keyRaw) {
    throw new Error(
      "Missing GSC_SERVICE_ACCOUNT_EMAIL or GSC_SERVICE_ACCOUNT_PRIVATE_KEY"
    );
  }

  const key = keyRaw.includes("\\n") ? keyRaw.replace(/\\n/g, "\n") : keyRaw;

  jwtClient = new JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  return jwtClient;
}

async function getAccessToken(): Promise<string> {
  const client = getJwtClient();
  const creds = await client.authorize();
  const token =
    // google-auth-library usa `access_token` em Credentials
    (creds as unknown as { access_token?: string }).access_token ??
    (creds as unknown as { token?: string }).token;
  if (!token) {
    throw new Error("Failed to authorize Search Console (no access token).");
  }
  return token;
}

function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function collectSearchConsoleDay(params: {
  brandId: string;
  siteUrl: string; // ex: "sc-domain:example.com" ou "https://example.com/"
  date: Date;
  rowLimit?: number;
}): Promise<{ inserted: number; date: string }> {
  const token = await getAccessToken();
  const ymd = toYmd(params.date);
  const rowLimit = params.rowLimit ?? 250;

  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    params.siteUrl
  )}/searchAnalytics/query`;

  const payload = await fetchJsonWithRetry<GscQueryResponse>(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        startDate: ymd,
        endDate: ymd,
        dimensions: ["query", "page"],
        rowLimit,
      }),
    },
    { retries: 2, backoffMs: 800, rateLimit: true }
  );

  const normalized = normalizeSearchConsoleRows(payload, new Date(ymd));
  if (normalized.length === 0) return { inserted: 0, date: ymd };

  const rows = normalized.map((r) => ({
    brandId: params.brandId,
    date: r.date,
    query: r.query,
    page: r.page,
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));

  const result = await db
    .insert(schema.searchConsoleSnapshots)
    .values(rows)
    .onConflictDoNothing()
    .returning({ id: schema.searchConsoleSnapshots.id });

  return { inserted: result.length, date: ymd };
}

