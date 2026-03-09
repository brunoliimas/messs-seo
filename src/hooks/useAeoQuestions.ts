"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetcher";
import type { AeoQuestion } from "@/lib/db/schema";

export function useAeoQuestions(brandId: string) {
  return useQuery({
    queryKey: ["aeoQuestions", brandId],
    enabled: !!brandId,
    queryFn: () =>
      fetchJson<{ brandId: string; items: AeoQuestion[] }>(
        `/api/data/aeo-questions?brandId=${encodeURIComponent(brandId)}&limit=10`
      ),
  });
}

