"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "./fetcher";
import type { BrandEntity } from "@/lib/db/schema";

export function useBrandEntity(brandId: string) {
  return useQuery({
    queryKey: ["brandEntity", brandId],
    enabled: !!brandId,
    queryFn: () =>
      fetchJson<{ brandId: string; entity: BrandEntity | null }>(
        `/api/data/brand-entity?brandId=${encodeURIComponent(brandId)}`
      ),
  });
}

