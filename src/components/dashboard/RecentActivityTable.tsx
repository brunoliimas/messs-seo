import { Card, CardContent } from "@/components/ui/card";
import { FindingBadge } from "@/components/shared/FindingBadge";

export interface RecentActivityItem {
  brandName: string;
  description: string;
  type: "critical" | "warning" | "good";
}

interface RecentActivityTableProps {
  items: RecentActivityItem[];
  /** Quando true, não renderiza o Card (para usar dentro de outro Card). */
  embedded?: boolean;
}

function TableContent({ items }: { items: RecentActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-8 px-6">
        Nenhuma atividade recente.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="grid">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-alt)]">
            <th
              scope="col"
              className="text-left px-6 py-4 text-metric text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider"
            >
              Marca
            </th>
            <th
              scope="col"
              className="text-left px-6 py-4 text-metric text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider"
            >
              Achado
            </th>
            <th
              scope="col"
              className="text-left px-6 py-4 text-metric text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider w-28"
            >
              Tipo
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={`${item.brandName}-${i}`}
              className="border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--bg-surface-alt)] transition-colors duration-[var(--transition-fast)]"
            >
              <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                {item.brandName}
              </td>
              <td className="px-6 py-4 text-sm text-[var(--text-secondary)] max-w-md">
                <span className="line-clamp-2">{item.description}</span>
              </td>
              <td className="px-6 py-4">
                <FindingBadge type={item.type} size="sm" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RecentActivityTable({ items, embedded }: RecentActivityTableProps) {
  const content = <TableContent items={items} />;
  if (embedded) {
    return content;
  }
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">{content}</CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  );
}
