import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntretienById } from "@/lib/data";
import { getWizardDataForEntretien } from "@/lib/wizardData";
import { VueEntretien } from "@/components/entretiens/VueEntretien";

export default function EntretienVuePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const entretien = getEntretienById(id);
  if (!entretien) notFound();

  const wizard = getWizardDataForEntretien(entretien);

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <Link
        href={`/entretiens/${id}`}
        className="text-[14px] text-gris-60 hover:text-applipro mb-4 inline-block"
      >
        ← Retour à la fiche entretien
      </Link>
      <h1 className="text-2xl font-semibold text-applipro-dark mt-1 mb-2">
        Vue d&apos;entretien
      </h1>
      <p className="text-[14px] text-gris-60 mb-6">
        Consultez les préparations du collaborateur et du manager, prenez des notes en séance et rédigez le bilan de l&apos;entretien.
      </p>
      <VueEntretien entretien={entretien} initialWizard={wizard} />
    </div>
  );
}
