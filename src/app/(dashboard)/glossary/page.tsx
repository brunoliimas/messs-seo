import { SectionTitle } from "@/components/shared/SectionTitle";
import { GlossarySearch } from "./_components/GlossarySearch";
import { GLOSSARY } from "@/lib/constants/glossary";

export default function GlossaryPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SectionTitle
        title="Glossário"
        subtitle={`${GLOSSARY.length} TERMOS TÉCNICOS`}
      />
      <GlossarySearch terms={GLOSSARY} />
    </div>
  );
}
