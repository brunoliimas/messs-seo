"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKeywordSuggestions } from "@/hooks/useKeywordSuggestions";

export function KeywordSuggestionsCard({
  brandId,
  keyword,
}: {
  brandId: string;
  keyword?: string;
}) {
  const { data, isLoading, error } = useKeywordSuggestions(brandId, keyword);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Sugestões de keywords</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {error && (
          <p className="text-sm text-destructive">
            Falha ao carregar sugestões.
          </p>
        )}
        {data && (
          <>
            <p className="text-xs text-muted-foreground">
              {data.keyword ? `Base: ${data.keyword}` : "Base: (todas)"}
            </p>
            <ul className="space-y-1">
              {data.items.slice(0, 10).map((s) => (
                <li key={s.id} className="text-xs flex justify-between gap-3">
                  <span className="truncate">{s.suggestion}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {s.score}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

