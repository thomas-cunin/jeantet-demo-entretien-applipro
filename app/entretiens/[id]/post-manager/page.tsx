import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntretienById } from "@/lib/data";
import { getWizardDataForEntretien } from "@/lib/wizardData";
import { PostEntretienManager } from "@/components/entretiens/PostEntretienManager";

export default function PostManagerPage({
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
        href={`/entretiens/${id}/finalisation`}
        className="text-[14px] text-gris-60 hover:text-applipro mb-4 inline-block"
      >
        &larr; Retour à la finalisation
      </Link>
      <h1 className="text-2xl font-semibold text-applipro-dark mt-1 mb-2">
        Post-entretien — Manager
      </h1>
      <p className="text-[14px] text-gris-60 mb-6">
        Synthèse de l&apos;entretien et signaux RH à remonter.
      </p>
      <PostEntretienManager entretienId={id} initialWizard={wizard} />
    </div>
  );
}
