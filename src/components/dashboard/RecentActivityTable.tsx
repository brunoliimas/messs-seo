import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      <p className="text-sm text-muted-foreground text-center py-8 px-6">
        Nenhuma atividade recente.
      </p>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-metric text-[11px] uppercase tracking-wider">
            Marca
          </TableHead>
          <TableHead className="text-metric text-[11px] uppercase tracking-wider">
            Achado
          </TableHead>
          <TableHead className="text-metric text-[11px] uppercase tracking-wider w-28">
            Tipo
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, i) => (
          <TableRow key={`${item.brandName}-${i}`}>
            <TableCell className="font-medium">{item.brandName}</TableCell>
            <TableCell className="text-muted-foreground max-w-md">
              <span className="line-clamp-2">{item.description}</span>
            </TableCell>
            <TableCell>
              <FindingBadge type={item.type} size="sm" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
