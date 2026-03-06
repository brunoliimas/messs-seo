import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string;
  sublabel?: string;
}

export function StatsCard({ label, value, sublabel }: StatsCardProps) {
  return (
    <Card className="border-[var(--border-subtle)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] transition-shadow duration-[var(--transition-fast)] hover:shadow-[var(--shadow-card-hover)]">
      <CardContent className="p-5 lg:p-6">
        <p className="text-metric text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">
          {label}
        </p>
        <p
          className="text-3xl lg:text-4xl font-mono text-foreground leading-tight"
          style={{ fontFamily: "var(--font-family-mono)" }}
        >
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-1.5">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
