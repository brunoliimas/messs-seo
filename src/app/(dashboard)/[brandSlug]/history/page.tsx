import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { HistoryClient } from "./_components/HistoryClient";
import { getBrandBySlug, getTimeline, getAllTimelines } from "@/lib/dal";

interface HistoryPageProps {
  params: Promise<{ brandSlug: string }>;
}

export async function generateMetadata({ params }: HistoryPageProps) {
  const { brandSlug } = await params;
  const brand = await getBrandBySlug(brandSlug);
  if (!brand) return { title: "Marca não encontrada" };
  return { title: `Evolução — ${brand.name}` };
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { brandSlug } = await params;

  const brand = await getBrandBySlug(brandSlug);
  if (!brand) notFound();

  const [timeline, allBrandsTimeline] = await Promise.all([
    getTimeline(brandSlug),
    getAllTimelines(),
  ]);

  const periodLabel =
    timeline.length > 0
      ? `${timeline[0].label} A ${timeline[timeline.length - 1].label}`
      : "SEM DADOS";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SectionTitle
        title="Evolução Temporal"
        subtitle={`${brand.name.toUpperCase()} — ${periodLabel}`}
      />

      <HistoryClient
        brand={brand}
        timeline={timeline}
        allBrandsTimeline={allBrandsTimeline}
      />
    </div>
  );
}
