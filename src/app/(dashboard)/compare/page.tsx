import { SectionTitle } from "@/components/shared/SectionTitle";
import { ScoreSummary } from "./_components/ScoreSummary";
import { CompareRadar } from "@/components/charts/CompareRadar";
import { CompareTable } from "./_components/CompareTable";
import { BiggestProblem } from "./_components/BiggestProblem";
import { getBrands, getAllSnapshots, getAllFindings } from "@/lib/dal";

export default async function ComparePage() {
  const [brands, snapshots, findings] = await Promise.all([
    getBrands(),
    getAllSnapshots(),
    getAllFindings(),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <SectionTitle
        title="Comparativo"
        subtitle="GALDERMA BRASIL — 3 MARCAS LADO A LADO"
      />

      {/* Score rings por marca */}
      <ScoreSummary brands={brands} />

      {/* Radar chart + Biggest problem side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompareRadar brands={brands} />
        <BiggestProblem brands={brands} findings={findings} />
      </div>

      {/* Full comparison table */}
      <CompareTable brands={brands} snapshots={snapshots} />
    </div>
  );
}
