"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetcher";
import type { KeywordSuggestion } from "@/lib/db/schema";

export function useKeywordSuggestions(brandId: string, keyword?: string) {
  const qs = new URLSearchParams({ brandId, limit: "20" });
  if (keyword) qs.set("keyword", keyword);

  return useQuery({
    queryKey: ["keywordSuggestions", brandId, keyword ?? null],
    enabled: !!brandId,
    queryFn: () =>
      fetchJson<{ brandId: string; keyword: string | null; items: KeywordSuggestion[] }>(
        `/api/data/keyword-suggestions?${qs.toString()}`
      ),
  });
}

