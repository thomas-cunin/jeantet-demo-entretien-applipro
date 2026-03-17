import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntretienById } from "@/lib/data";
import { getWizardDataForEntretien } from "@/lib/wizardData";
import { FinalisationEntretien } from "@/components/entretiens/FinalisationEntretien";

export default function FinalisationPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const entretien = getEntretienById(id);
  if (!entretien) notFound();

  const wizard = getWizardDataForEntretien(entretien);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <Link
        href={`/entretiens/${id}/vue`}
        className="text-[14px] text-gris-60 hover:text-applipro mb-4 inline-block"
      >
        &larr; Retour à la vue entretien
      </Link>
      <h1 className="text-2xl font-semibold text-applipro-dark mt-1 mb-2">
        Finalisation de l&apos;entretien
      </h1>
      <p className="text-[14px] text-gris-60 mb-6">
        Consultez la synthèse et procédez à la signature de l&apos;entretien.
      </p>
      <FinalisationEntretien entretienId={id} initialWizard={wizard} />
    </div>
  );
}
