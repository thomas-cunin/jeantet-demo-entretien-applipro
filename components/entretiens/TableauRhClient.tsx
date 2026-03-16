"use client";

import { useEffect, useState, useCallback } from "react";
import type { EntretienWithDetails, Campagne } from "@/lib/types";
import {
  type WizardEntretienData,
  type WizardSignalRh,
  SIGNAL_RH_CATEGORIES,
  getWizardDataForEntretien,
  loadWizardFromStorage,
} from "@/lib/wizardData";

interface Props {
  entretiens: EntretienWithDetails[];
  campagnes: Campagne[];
}

interface EntretienRhData {
  entretien: EntretienWithDetails;
  wizard: WizardEntretienData;
}

interface SignalementDisplay {
  entretien: EntretienWithDetails;
  wizard: WizardEntretienData;
  signal: WizardSignalRh;
  index: number;
}

export function TableauRhClient({ entretiens, campagnes }: Props) {
  const [data, setData] = useState<EntretienRhData[]>([]);
  const [activeTab, setActiveTab] = useState<"campagne" | "signalements" | "formation" | "feedbacks">("campagne");

  useEffect(() => {
    const items = entretiens.map((ent) => {
      const base = getWizardDataForEntretien(ent);
      const wizard = loadWizardFromStorage(ent.id, base);
      return { entretien: ent, wizard };
    });
    setData(items);
  }, [entretiens]);

  const campagne = campagnes[0];
  const total = data.length;
  const realises = data.filter((d) => d.entretien.statut === "realise").length;
  const planifies = data.filter((d) => d.entretien.statut === "planifie").length;
  const enAttente = data.filter((d) => d.entretien.statut === "en_attente").length;
  const reportes = data.filter((d) => d.entretien.statut === "reporte").length;
  const tauxCompletion = total > 0 ? Math.round((realises / total) * 100) : 0;

  const signalements: SignalementDisplay[] = [];
  for (const d of data) {
    const signauxRh = d.wizard.session.signauxRh ?? [];
    signauxRh.forEach((signal, index) => {
      if (signal.actif) {
        signalements.push({ entretien: d.entretien, wizard: d.wizard, signal, index });
      }
    });
  }

  const allFormations: { intitule: string; origine: string; collaborateur: string; entite: string; commentaire?: string }[] = [];
  for (const d of data) {
    const nom = `${d.entretien.collaborateur.prenom} ${d.entretien.collaborateur.nom}`;
    const entite = d.entretien.collaborateur.entite ?? "—";
    for (const f of d.wizard.preCollaborateur.besoinsFormation) {
      allFormations.push({ intitule: f.intitule, origine: "Collaborateur", collaborateur: nom, entite, commentaire: f.commentaire });
    }
    if (d.wizard.preManager.besoinsFormationManager) {
      allFormations.push({ intitule: d.wizard.preManager.besoinsFormationManager, origine: "Manager", collaborateur: nom, entite });
    }
    for (const f of d.wizard.session.decisionsFormation) {
      allFormations.push({ intitule: f.intitule, origine: f.origine === "manager" ? "Décision manager" : "Décision collaborateur", collaborateur: nom, entite, commentaire: f.commentaire });
    }
  }

  const feedbacks = data.filter((d) => d.wizard.validation.feedbackNote);

  const tabs = [
    { key: "campagne" as const, label: "Suivi campagne" },
    { key: "signalements" as const, label: `Signalements RH (${signalements.length})` },
    { key: "formation" as const, label: `Synthèse formation (${allFormations.length})` },
    { key: "feedbacks" as const, label: `Feedbacks (${feedbacks.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Indicateurs campagne */}
      {campagne && (
        <div className="bg-white border border-gris-10 rounded-applipro p-5" data-tour-id="rh-campagne">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[16px] font-semibold text-applipro-dark">
                {campagne.nom}
              </h2>
              <p className="text-[13px] text-gris-60 mt-0.5">
                Du {formatDateShort(campagne.dateDebut)} au {formatDateShort(campagne.dateFin)}
                {" — "}
                <span className="inline-flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${campagne.statut === "en_cours" ? "bg-statut-vert" : campagne.statut === "cloturee" ? "bg-gris-40" : "bg-applipro"}`} />
                  {campagne.statut === "en_cours" ? "En cours" : campagne.statut === "cloturee" ? "Clôturée" : "Planifiée"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-3 bg-gris-10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-applipro rounded-full transition-all"
                  style={{ width: `${tauxCompletion}%` }}
                />
              </div>
              <span className="text-[14px] font-semibold text-applipro">
                {tauxCompletion}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Kpi label="Total" value={total} color="text-noir" />
            <Kpi label="Réalisés" value={realises} color="text-statut-vert" />
            <Kpi label="Planifiés" value={planifies} color="text-applipro" />
            <Kpi label="En attente" value={enAttente} color="text-gris-60" />
            <Kpi label="Reportés" value={reportes} color="text-statut-orange" />
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="border-b border-gris-10">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-applipro text-applipro"
                  : "border-transparent text-gris-60 hover:text-noir hover:border-gris-20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "campagne" && (
        <CampagneTab data={data} />
      )}
      {activeTab === "signalements" && (
        <SignalementsTab signalements={signalements} />
      )}
      {activeTab === "formation" && (
        <FormationTab formations={allFormations} />
      )}
      {activeTab === "feedbacks" && (
        <FeedbacksTab feedbacks={feedbacks} />
      )}
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gris-05 rounded-applipro p-3 text-center">
      <p className="text-[12px] text-gris-60">{label}</p>
      <p className={`text-xl font-semibold mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}

function CampagneTab({ data }: { data: EntretienRhData[] }) {
  const entiteGroups = new Map<string, EntretienRhData[]>();
  for (const d of data) {
    const entite = d.entretien.collaborateur.entite ?? "Autre";
    const list = entiteGroups.get(entite) ?? [];
    list.push(d);
    entiteGroups.set(entite, list);
  }

  return (
    <div className="space-y-4" data-tour-id="rh-suivi-entite">
      {Array.from(entiteGroups.entries()).map(([entite, items]) => {
        const done = items.filter((i) => i.entretien.statut === "realise").length;
        const pct = Math.round((done / items.length) * 100);
        return (
          <div key={entite} className="bg-white border border-gris-10 rounded-applipro p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-noir">{entite}</h3>
              <span className="text-[13px] text-gris-60">{done}/{items.length} clôturés ({pct}%)</span>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.entretien.id} className="flex items-center justify-between p-2 rounded-md bg-gris-05 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-noir">
                      {item.entretien.collaborateur.prenom} {item.entretien.collaborateur.nom}
                    </span>
                    <span className="text-gris-60">— {item.entretien.collaborateur.poste}</span>
                  </div>
                  <StatutPill statut={item.entretien.statut} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SignalementsTab({ signalements }: { signalements: SignalementDisplay[] }) {
  const [traites, setTraites] = useState<Set<string>>(new Set());

  if (signalements.length === 0) {
    return (
      <div className="bg-white border border-gris-10 rounded-applipro p-6 text-center">
        <p className="text-[14px] text-gris-40 italic">Aucun signalement RH en cours.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-tour-id="rh-signalements">
      {signalements.map((item) => {
        const catLabel = SIGNAL_RH_CATEGORIES.find(
          (c) => c.value === item.signal.categorie
        )?.label ?? item.signal.categorie;
        const key = `${item.entretien.id}-${item.index}`;
        const isTraite = traites.has(key);
        return (
          <div
            key={key}
            className={`bg-white border-l-4 ${isTraite ? "border-l-statut-vert" : "border-l-statut-orange"} border border-gris-10 rounded-applipro p-4`}
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[12px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                isTraite
                  ? "bg-statut-vert/10 text-statut-vert border-statut-vert/20"
                  : "bg-statut-orange/10 text-statut-orange border-statut-orange/20"
              }`}>
                {isTraite ? "Traité" : catLabel}
              </span>
              {isTraite && (
                <span className="text-[12px] text-gris-60 italic">{catLabel}</span>
              )}
              <span className="text-[13px] text-gris-60">
                {item.entretien.collaborateur.prenom} {item.entretien.collaborateur.nom}
                {" — "}
                {item.entretien.collaborateur.entite}
              </span>
              <span className="text-[13px] text-gris-40">
                (Manager : {item.entretien.manager.prenom} {item.entretien.manager.nom})
              </span>
            </div>
            {item.signal.commentaire && (
              <p className="text-[14px] text-gris-80 leading-relaxed">
                {item.signal.commentaire}
              </p>
            )}
            {!isTraite && (
              <button
                type="button"
                onClick={() => setTraites((prev) => new Set(prev).add(key))}
                className="mt-3 text-[13px] font-medium text-statut-vert hover:text-statut-vert/80 flex items-center gap-1 px-3 py-1.5 rounded-applipro border border-statut-vert/30 bg-statut-vert/5 hover:bg-statut-vert/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Marquer comme traité
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FormationTab({ formations }: { formations: { intitule: string; origine: string; collaborateur: string; entite: string; commentaire?: string }[] }) {
  const exportCsv = useCallback(() => {
    const headers = ["Formation", "Collaborateur", "Entité", "Origine", "Commentaire"];
    const rows = formations.map((f) => [
      f.intitule,
      f.collaborateur,
      f.entite,
      f.origine,
      f.commentaire ?? "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "synthese_formation.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, [formations]);

  if (formations.length === 0) {
    return (
      <div className="bg-white border border-gris-10 rounded-applipro p-6 text-center">
        <p className="text-[14px] text-gris-40 italic">Aucun besoin en formation remonté.</p>
      </div>
    );
  }

  const byEntite = new Map<string, typeof formations>();
  for (const f of formations) {
    const list = byEntite.get(f.entite) ?? [];
    list.push(f);
    byEntite.set(f.entite, list);
  }

  return (
    <div className="space-y-4" data-tour-id="rh-formation">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={exportCsv}
          className="text-[13px] font-medium text-applipro hover:text-applipro/80 flex items-center gap-1.5 px-3 py-1.5 rounded-applipro border border-applipro/30 bg-applipro-05 hover:bg-applipro/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exporter CSV
        </button>
      </div>
      {Array.from(byEntite.entries()).map(([entite, items]) => (
        <div key={entite} className="bg-white border border-gris-10 rounded-applipro p-4">
          <h3 className="text-[14px] font-semibold text-noir mb-3">{entite}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-gris-60 border-b border-gris-10">
                  <th className="pb-2 pr-3 font-medium">Formation</th>
                  <th className="pb-2 pr-3 font-medium">Collaborateur</th>
                  <th className="pb-2 pr-3 font-medium">Origine</th>
                  <th className="pb-2 font-medium">Commentaire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gris-05">
                {items.map((f, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-3 font-medium text-noir">{f.intitule}</td>
                    <td className="py-2 pr-3 text-gris-80">{f.collaborateur}</td>
                    <td className="py-2 pr-3">
                      <span className={`text-[12px] px-2 py-0.5 rounded-full ${
                        f.origine.startsWith("Décision") ? "bg-statut-vert/10 text-statut-vert" : "bg-applipro-05 text-applipro"
                      }`}>
                        {f.origine}
                      </span>
                    </td>
                    <td className="py-2 text-gris-60">{f.commentaire ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeedbacksTab({ feedbacks }: { feedbacks: EntretienRhData[] }) {
  if (feedbacks.length === 0) {
    return (
      <div className="bg-white border border-gris-10 rounded-applipro p-6 text-center">
        <p className="text-[14px] text-gris-40 italic">Aucun feedback post-entretien saisi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-tour-id="rh-feedbacks">
      {feedbacks.map((item) => {
        const note = item.wizard.validation.feedbackNote!;
        const color = note >= 4 ? "bg-statut-vert" : note >= 3 ? "bg-statut-orange" : "bg-statut-rouge";
        return (
          <div key={item.entretien.id} className="bg-white border border-gris-10 rounded-applipro p-4 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-[16px] font-bold shrink-0`}>
              {note}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-medium text-noir">
                  {item.entretien.collaborateur.prenom} {item.entretien.collaborateur.nom}
                </span>
                <span className="text-[13px] text-gris-60">
                  — {item.entretien.collaborateur.entite}
                </span>
                <span className="text-[13px] text-gris-40">
                  (Manager : {item.entretien.manager.prenom} {item.entretien.manager.nom})
                </span>
              </div>
              {item.wizard.validation.feedbackCommentaire && (
                <p className="text-[13px] text-gris-80 mt-1 leading-relaxed">
                  {item.wizard.validation.feedbackCommentaire}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatutPill({ statut }: { statut: string }) {
  const map: Record<string, { label: string; classes: string }> = {
    realise: { label: "Réalisé", classes: "bg-statut-vert/10 text-statut-vert" },
    planifie: { label: "Planifié", classes: "bg-applipro-05 text-applipro" },
    en_attente: { label: "En attente", classes: "bg-gris-10 text-gris-60" },
    reporte: { label: "Reporté", classes: "bg-statut-orange/10 text-statut-orange" },
    annule: { label: "Annulé", classes: "bg-statut-rouge/10 text-statut-rouge" },
  };
  const cfg = map[statut] ?? { label: statut, classes: "bg-gris-10 text-gris-60" };
  return (
    <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function formatDateShort(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
