import { SectionTitle } from "@/components/shared/SectionTitle";

export default function ReportsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <SectionTitle title="Relatórios" subtitle="PDFs GERADOS" />
      <div className="card p-8 text-center text-[var(--text-secondary)]">
        <p className="text-metric text-sm mb-2">FASE 3</p>
        <p className="text-sm">Geração de PDF com relatório mensal automático.</p>
      </div>
    </div>
  );
}
