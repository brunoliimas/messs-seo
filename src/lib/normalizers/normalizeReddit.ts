export interface NormalizedRedditMention {
  title: string;
  subreddit: string;
  url: string;
  score: number;
  numComments: number;
  createdAt?: Date;
}

export function normalizeRedditSearchJson(
  payload: any
): NormalizedRedditMention[] {
  const children = payload?.data?.children;
  if (!Array.isArray(children)) return [];

  return children
    .map((c: any) => c?.data)
    .filter(Boolean)
    .map((d: any) => {
      const permalink =
        typeof d.permalink === "string" ? `https://www.reddit.com${d.permalink}` : "";
      const url = typeof d.url === "string" ? d.url : permalink;
      const createdAt =
        typeof d.created_utc === "number" ? new Date(d.created_utc * 1000) : undefined;
      return {
        title: String(d.title ?? "").trim(),
        subreddit: String(d.subreddit ?? "").trim(),
        url: url || permalink || "",
        score: Number(d.score ?? 0) || 0,
        numComments: Number(d.num_comments ?? 0) || 0,
        createdAt,
      };
    })
    .filter((m: NormalizedRedditMention) => !!m.title && !!m.subreddit && !!m.url);
}

