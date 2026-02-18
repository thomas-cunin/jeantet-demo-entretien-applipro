import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntretienById } from "@/lib/data";
import { getWizardDataForEntretien } from "@/lib/wizardData";
import { EntretienWizard } from "@/components/entretiens/EntretienWizard";

export default function EntretienParcoursPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const entretien = getEntretienById(id);
  if (!entretien) notFound();

  const wizard = getWizardDataForEntretien(entretien);

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <Link
        href={`/entretiens/${id}`}
        className="text-[14px] text-gris-60 hover:text-applipro mb-4 inline-block"
      >
        ← Retour à la fiche entretien
      </Link>
      <h1 className="text-2xl font-semibold text-applipro-dark mt-1 mb-4">
        Lancement de l&apos;entretien
      </h1>
      <p className="text-[14px] text-gris-60 mb-6">
        Wizard multi-étapes côté manager pour suivre la préparation, la
        conduite et la validation de l&apos;entretien individuel, avec
        visualisation des réponses simulées du collaborateur.
      </p>
      <EntretienWizard entretien={entretien} wizard={wizard} />
    </div>
  );
}

