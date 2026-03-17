import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntretienById } from "@/lib/data";
import { getWizardDataForEntretien } from "@/lib/wizardData";
import { SyntheseEntretienComplete } from "@/components/entretiens/SyntheseEntretienComplete";

export default function SynthesePage({
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
        href="/tableau-rh"
        className="text-[14px] text-gris-60 hover:text-applipro mb-4 inline-block"
      >
        &larr; Retour au tableau RH
      </Link>
      <h1 className="text-2xl font-semibold text-applipro-dark mt-1 mb-2">
        Synthèse de l&apos;entretien
      </h1>
      <p className="text-[14px] text-gris-60 mb-6">
        {entretien.collaborateur.prenom} {entretien.collaborateur.nom}
        {" — "}
        {entretien.collaborateur.poste}
        {entretien.collaborateur.entite && `, ${entretien.collaborateur.entite}`}
      </p>
      <SyntheseEntretienComplete entretienId={id} initialWizard={wizard} />
    </div>
  );
}
