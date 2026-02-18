import type { StatutEntretien } from "@/lib/types";

const labels: Record<StatutEntretien, string> = {
  planifie: "Planifié",
  realise: "Réalisé",
  reporte: "Reporté",
  annule: "Annulé",
  en_attente: "En attente",
};

// Style type « pill » (Onboarding Applipro) : vert pour terminé, gris pour les autres
const styles: Record<StatutEntretien, string> = {
  planifie: "bg-gris-20 text-gris-80",
  realise: "bg-statut-vert text-white",
  reporte: "bg-gris-20 text-gris-80",
  annule: "bg-gris-20 text-gris-80",
  en_attente: "bg-gris-20 text-gris-80",
};

export function StatutBadge({ statut }: { statut: StatutEntretien }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[13px] font-medium ${styles[statut]}`}
    >
      {labels[statut]}
    </span>
  );
}
