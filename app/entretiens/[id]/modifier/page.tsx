import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntretienById } from "@/lib/data";
import { FormulaireEntretien } from "@/components/entretiens/FormulaireEntretien";

export default function ModifierEntretienPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const entretien = getEntretienById(id);
  if (!entretien) notFound();

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <Link
        href={`/entretiens/${id}`}
        className="text-[14px] text-gris-60 hover:text-applipro mb-4 inline-block"
      >
        ← Retour à l’entretien
      </Link>
      <h1 className="text-2xl font-semibold text-applipro-dark mt-1 mb-6">
        Modifier l’entretien
      </h1>
      <FormulaireEntretien entretien={entretien} />
    </div>
  );
}
