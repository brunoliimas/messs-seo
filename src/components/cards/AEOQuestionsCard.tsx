"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAeoQuestions } from "@/hooks/useAeoQuestions";

export function AEOQuestionsCard({ brandId }: { brandId: string }) {
  const { data, isLoading, error } = useAeoQuestions(brandId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Perguntas relevantes (StackExchange)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {error && (
          <p className="text-sm text-destructive">Falha ao carregar perguntas.</p>
        )}
        {data && (
          <ul className="space-y-2">
            {data.items.slice(0, 5).map((q) => (
              <li key={q.id} className="text-xs">
                <a
                  href={q.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:underline"
                >
                  {q.question}
                </a>
                <div className="text-muted-foreground flex gap-2">
                  <span className="tabular-nums">score {q.score}</span>
                  <span className="tabular-nums">{q.viewCount} views</span>
                  <span className="tabular-nums">{q.answerCount} respostas</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

