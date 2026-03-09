"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetcher";
import type { RedditMention } from "@/lib/db/schema";

export function useRedditMentions(brandId: string) {
  return useQuery({
    queryKey: ["redditMentions", brandId],
    enabled: !!brandId,
    queryFn: () =>
      fetchJson<{ brandId: string; items: RedditMention[] }>(
        `/api/data/reddit-mentions?brandId=${encodeURIComponent(brandId)}&limit=20`
      ),
  });
}

