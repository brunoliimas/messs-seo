import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FindingBadgeProps {
  type: "critical" | "warning" | "good";
  label?: string;
  size?: "sm" | "md";
}

const config = {
  critical: {
    icon: AlertTriangle,
    label: "Crítico",
    variant: "destructive" as const,
  },
  warning: {
    icon: AlertCircle,
    label: "Atenção",
    variant: "outline" as const,
  },
  good: {
    icon: CheckCircle,
    label: "Aprovado",
    variant: "secondary" as const,
  },
} as const;

export function FindingBadge({ type, label, size = "sm" }: FindingBadgeProps) {
  const { icon: Icon, label: defaultLabel, variant } = config[type];
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <Badge variant={variant} className={cn("gap-1.5 font-mono uppercase tracking-wide", size === "md" && "px-2.5 py-1 text-xs")}>
      <Icon size={iconSize} />
      {label || defaultLabel}
    </Badge>
  );
}
