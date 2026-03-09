export interface NormalizedAeoQuestion {
  question: string;
  link: string;
  score: number;
  viewCount: number;
  answerCount: number;
  createdAt?: Date;
}

export function normalizeStackExchangeSearch(
  payload: any
): NormalizedAeoQuestion[] {
  const items = payload?.items;
  if (!Array.isArray(items)) return [];

  return items
    .filter(Boolean)
    .map((it: any) => {
      const createdAt =
        typeof it.creation_date === "number"
          ? new Date(it.creation_date * 1000)
          : undefined;
      return {
        question: String(it.title ?? "").trim(),
        link: String(it.link ?? "").trim(),
        score: Number(it.score ?? 0) || 0,
        viewCount: Number(it.view_count ?? 0) || 0,
        answerCount: Number(it.answer_count ?? 0) || 0,
        createdAt,
      };
    })
    .filter((q: NormalizedAeoQuestion) => !!q.question && !!q.link);
}

