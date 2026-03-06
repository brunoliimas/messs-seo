interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionTitle({ title, subtitle, action }: SectionTitleProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-heading-lg text-xl">{title}</h2>
        {subtitle && (
          <p className="text-metric text-[11px] text-[var(--text-muted)] mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
