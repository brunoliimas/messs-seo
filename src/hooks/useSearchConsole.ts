"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetcher";
import type { SearchConsoleSnapshot } from "@/lib/db/schema";

export interface SearchConsoleData {
  brandId: string;
  date: string | null;
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  rows: SearchConsoleSnapshot[];
}

export function useSearchConsole(brandId: string) {
  return useQuery({
    queryKey: ["searchConsole", brandId],
    enabled: !!brandId,
    queryFn: () =>
      fetchJson<SearchConsoleData>(
        `/api/data/search-console?brandId=${encodeURIComponent(brandId)}`
      ),
  });
}

