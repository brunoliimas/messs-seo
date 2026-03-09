"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRedditMentions } from "@/hooks/useRedditMentions";

export function RedditMentionsCard({ brandId }: { brandId: string }) {
  const { data, isLoading, error } = useRedditMentions(brandId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Reddit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {error && (
          <p className="text-sm text-destructive">Falha ao carregar menções.</p>
        )}
        {data && (
          <>
            <p className="text-xs text-muted-foreground">
              Últimas {data.items.length} menções
            </p>
            <ul className="space-y-2">
              {data.items.slice(0, 5).map((m) => (
                <li key={m.id} className="text-xs">
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:underline"
                  >
                    {m.title}
                  </a>
                  <div className="text-muted-foreground flex gap-2">
                    <span>r/{m.subreddit}</span>
                    <span className="tabular-nums">↑{m.score}</span>
                    <span className="tabular-nums">{m.numComments} comentários</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

