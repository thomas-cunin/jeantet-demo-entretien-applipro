import Link from "next/link";
import { FormulaireEntretien } from "@/components/entretiens/FormulaireEntretien";

export default function NouvelEntretienPage() {
  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <Link
        href="/entretiens"
        className="text-[14px] text-gris-60 hover:text-applipro mb-4 inline-block"
      >
        ← Retour à la liste
      </Link>
      <h1 className="text-2xl font-semibold text-applipro-dark mt-1 mb-6">
        Nouvel entretien
      </h1>
      <FormulaireEntretien />
    </div>
  );
}
