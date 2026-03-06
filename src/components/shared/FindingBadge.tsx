import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

interface FindingBadgeProps {
  type: "critical" | "warning" | "good";
  label?: string;
  size?: "sm" | "md";
}

const config = {
  critical: {
    icon: AlertTriangle,
    label: "Crítico",
    className: "badge--bad",
  },
  warning: {
    icon: AlertCircle,
    label: "Atenção",
    className: "badge--warn",
  },
  good: {
    icon: CheckCircle,
    label: "Aprovado",
    className: "badge--good",
  },
} as const;

export function FindingBadge({ type, label, size = "sm" }: FindingBadgeProps) {
  const { icon: Icon, label: defaultLabel, className } = config[type];
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <span className={`badge ${className}`}>
      <Icon size={iconSize} />
      {label || defaultLabel}
    </span>
  );
}
