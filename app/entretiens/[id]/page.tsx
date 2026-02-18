import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntretienById } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { TypeBadge } from "@/components/entretiens/TypeBadge";
import { EntretienSimulationActions } from "@/components/entretiens/EntretienSimulationActions";

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function EntretienDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const entretien = getEntretienById(id);
  if (!entretien) notFound();

  const { collaborateur, manager } = entretien;

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Link
            href="/entretiens"
            className="text-[14px] text-gris-60 hover:text-applipro mb-2 inline-block"
          >
            ← Retour à la liste
          </Link>
          <h1 className="text-2xl font-semibold text-applipro-dark mt-1">
            Entretien – {collaborateur.prenom} {collaborateur.nom}
          </h1>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex flex-wrap gap-2">
              <TypeBadge type={entretien.type} />
            </div>
            <EntretienSimulationActions entretien={entretien} />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href={`/entretiens/${id}/parcours`}>
            <Button variant="primary" size="small">
              Parcours d&apos;entretien
            </Button>
          </Link>
          <Link href={`/entretiens/${id}/vue`}>
            <Button variant="secondary" size="small">
              Vue entretien
            </Button>
          </Link>
          <Link href={`/entretiens/${id}/modifier`}>
            <Button variant="secondary" size="small">
              Modifier
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gris-10 overflow-hidden">
        <div className="p-6 space-y-6">
          <section>
            <h2 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-3">
              Participants
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gris-05 rounded-applipro">
                <p className="text-[13px] text-gris-60">Collaborateur</p>
                <p className="font-medium text-noir">
                  {collaborateur.prenom} {collaborateur.nom}
                </p>
                <p className="text-[14px] text-gris-60">{collaborateur.email}</p>
                {collaborateur.poste && (
                  <p className="text-[14px] text-gris-80 mt-1">{collaborateur.poste}</p>
                )}
              </div>
              <div className="p-4 bg-gris-05 rounded-applipro">
                <p className="text-[13px] text-gris-60">Manager</p>
                <p className="font-medium text-noir">
                  {manager.prenom} {manager.nom}
                </p>
                <p className="text-[14px] text-gris-60">{manager.email}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-3">
              Planification
            </h2>
            <dl className="grid sm:grid-cols-2 gap-3 text-[14px]">
              <div>
                <dt className="text-gris-60">Date prévue</dt>
                <dd className="font-medium text-noir">{formatDate(entretien.datePrevue)}</dd>
              </div>
              {entretien.dateReelle && (
                <div>
                  <dt className="text-gris-60">Date réalisée</dt>
                  <dd className="font-medium text-noir">{formatDate(entretien.dateReelle)}</dd>
                </div>
              )}
              {entretien.lieu && (
                <div className="sm:col-span-2">
                  <dt className="text-gris-60">Lieu</dt>
                  <dd className="font-medium text-noir">{entretien.lieu}</dd>
                </div>
              )}
            </dl>
          </section>

          {entretien.notes && (
            <section>
              <h2 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                Notes
              </h2>
              <p className="text-[14px] text-noir whitespace-pre-wrap">{entretien.notes}</p>
            </section>
          )}

          {entretien.objectifs && (
            <section>
              <h2 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                Objectifs
              </h2>
              <p className="text-[14px] text-noir whitespace-pre-wrap">{entretien.objectifs}</p>
            </section>
          )}

          {entretien.compteRendu && (
            <section>
              <h2 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                Compte rendu
              </h2>
              <p className="text-[14px] text-noir whitespace-pre-wrap">{entretien.compteRendu}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
