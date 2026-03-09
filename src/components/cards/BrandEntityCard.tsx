"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBrandEntity } from "@/hooks/useBrandEntity";

export function BrandEntityCard({ brandId }: { brandId: string }) {
  const { data, isLoading, error } = useBrandEntity(brandId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Entidade (Wikipedia)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {error && (
          <p className="text-sm text-destructive">Falha ao carregar entidade.</p>
        )}
        {data && (
          <>
            {!data.entity ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma entidade encontrada.
              </p>
            ) : (
              <>
                <a
                  href={data.entity.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold hover:underline"
                >
                  {data.entity.title}
                </a>
                {data.entity.extract && (
                  <p className="text-xs text-muted-foreground line-clamp-4">
                    {data.entity.extract}
                  </p>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

