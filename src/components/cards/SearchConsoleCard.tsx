"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchConsole } from "@/hooks/useSearchConsole";

export function SearchConsoleCard({ brandId }: { brandId: string }) {
  const { data, isLoading, error } = useSearchConsole(brandId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Google Search Console</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {error && (
          <p className="text-sm text-destructive">
            Falha ao carregar Search Console.
          </p>
        )}
        {data && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Cliques</p>
                <p className="font-semibold">{data.totals.clicks}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Impressões</p>
                <p className="font-semibold">{data.totals.impressions}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CTR</p>
                <p className="font-semibold">
                  {(data.totals.ctr * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Posição média</p>
                <p className="font-semibold">{data.totals.position.toFixed(1)}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                {data.date ? `Último dia: ${data.date}` : "Sem dados"}
              </p>
            </div>

            {data.rows.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-medium mb-2">Top queries</p>
                <ul className="space-y-1">
                  {data.rows.slice(0, 5).map((r) => (
                    <li key={`${r.query}-${r.page}`} className="text-xs flex justify-between gap-3">
                      <span className="truncate">{r.query || "(sem query)"}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {r.clicks}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

