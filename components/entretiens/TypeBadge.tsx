import type { TypeEntretien } from "@/lib/types";

const labels: Record<TypeEntretien, string> = {
  integration: "Intégration",
  suivi: "Suivi",
  bilan: "Bilan",
  autre: "Autre",
};

export function TypeBadge({ type }: { type: TypeEntretien }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-applipro text-[13px] font-medium bg-gris-10 text-gris-80">
      {labels[type]}
    </span>
  );
}
