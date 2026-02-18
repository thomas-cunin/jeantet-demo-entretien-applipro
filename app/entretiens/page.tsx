import Link from "next/link";
import { getEntretiensWithDetails } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { EntretiensList } from "@/components/entretiens/EntretiensList";

export default function EntretiensPage() {
  const entretiens = getEntretiensWithDetails();

  const total = entretiens.length;
  const totalRealises = entretiens.filter((e) => e.statut === "realise").length;
  const totalPlanifies = entretiens.filter((e) => e.statut === "planifie").length;
  const totalEnAttente = entretiens.filter((e) => e.statut === "en_attente").length;
  const totalReportes = entretiens.filter((e) => e.statut === "reporte").length;
  const totalAnnules = entretiens.filter((e) => e.statut === "annule").length;

  const today = new Date();
  const enRetard = entretiens.filter((e) => {
    if (e.statut === "realise" || e.statut === "annule") return false;
    const d = new Date(e.datePrevue);
    return d < today;
  }).length;

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      {/* En-tête style Onboarding : titre + sous-titre + boutons */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-noir">
            Entretiens individuels
          </h1>
          <p className="text-gris-60 text-[14px] mt-1">
            Suivez et pilotez les entretiens individuels de vos collaborateurs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <a href="#">
            <Button variant="secondary" size="regular">
              Voir les templates
            </Button>
          </a>
          <Link href="/entretiens/nouveau">
            <Button variant="primary" size="regular" iconLeft={<PlusIcon />}>
              Nouvel entretien
            </Button>
          </Link>
        </div>
      </div>

      {/* Indicateurs synthétiques */}
      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="bg-white border border-gris-10 rounded-applipro p-4">
          <p className="text-[13px] text-gris-60">Entretiens de mon périmètre</p>
          <p className="text-2xl font-semibold text-noir mt-1">{total}</p>
          <p className="text-[13px] text-gris-60 mt-1">
            {totalRealises} clôturés • {totalPlanifies} planifiés
          </p>
        </div>
        <div className="bg-white border border-gris-10 rounded-applipro p-4">
          <p className="text-[13px] text-gris-60">À planifier / en attente</p>
          <p className="text-2xl font-semibold text-noir mt-1">{totalEnAttente}</p>
          <p className="text-[13px] text-gris-60 mt-1">
            {totalReportes} reportés • {totalAnnules} annulés
          </p>
        </div>
        <div className="bg-white border border-gris-10 rounded-applipro p-4">
          <p className="text-[13px] text-gris-60">Entretiens en retard</p>
          <p className="text-2xl font-semibold text-statut-rouge mt-1">
            {enRetard}
          </p>
          <p className="text-[13px] text-gris-60 mt-1">
            Date prévue dépassée et non clôturés
          </p>
        </div>
        <div className="bg-white border border-gris-10 rounded-applipro p-4">
          <p className="text-[13px] text-gris-60">Vue synthétique</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[13px]">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-statut-vert" />
              Réalisé : {totalRealises}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-applipro" />
              Planifié : {totalPlanifies}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-gris-40" />
              En attente : {totalEnAttente}
            </span>
          </div>
        </div>
      </section>

      <EntretiensList entretiens={entretiens} />
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
