import { notFound } from "next/navigation";
import { BrandDetailClient } from "./_components/BrandDetailClient";
import {
  getBrandBySlug,
  getSnapshots,
  getFindings,
  getRecommendations,
} from "@/lib/dal";

interface BrandPageProps {
  params: Promise<{ brandSlug: string }>;
}

export async function generateMetadata({ params }: BrandPageProps) {
  const { brandSlug } = await params;
  const brand = await getBrandBySlug(brandSlug);

  if (!brand) return { title: "Marca não encontrada" };

  return {
    title: brand.name,
    description: `Auditoria digital ${brand.name} — SEO, AEO, CWV, LLM Parsers`,
  };
}

export default async function BrandDetailPage({ params }: BrandPageProps) {
  const { brandSlug } = await params;

  const brand = await getBrandBySlug(brandSlug);
  if (!brand) notFound();

  const [snapshots, findings, recommendations] = await Promise.all([
    getSnapshots(brandSlug),
    getFindings(brandSlug),
    getRecommendations(brandSlug),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <BrandDetailClient
        brand={brand}
        snapshots={snapshots}
        findings={findings}
        recommendations={recommendations}
      />
    </div>
  );
}
