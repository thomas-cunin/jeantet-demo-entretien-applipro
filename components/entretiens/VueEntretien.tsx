"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { EntretienWithDetails } from "@/lib/types";
import type { WizardEntretienData, WizardPointAmeliorer, WizardRemarquesChamps } from "@/lib/wizardData";
import { loadWizardFromStorage, saveWizardToStorage } from "@/lib/wizardData";
import { Button } from "@/components/ui/Button";
import { TypeBadge } from "@/components/entretiens/TypeBadge";

interface VueEntretienProps {
  entretien: EntretienWithDetails;
  initialWizard: WizardEntretienData;
}

const DEFAULT_BILAN = {
  syntheseGlobale: "",
  pointsAmeliorer: [] as WizardPointAmeliorer[],
  remarquesCollaborateur: "",
  remarquesManager: "",
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Composant pour ajouter une remarque sur un champ
function ChampAvecRemarque({
  champId,
  remarquesChamps,
  onUpdateRemarque,
  children,
}: {
  champId: string;
  remarquesChamps: WizardRemarquesChamps;
  onUpdateRemarque: (champId: string, remarque: string) => void;
  children: React.ReactNode;
}) {
  const [ouvert, setOuvert] = useState(false);
  const remarque = remarquesChamps[champId] || "";
  const hasRemarque = remarque.trim().length > 0;

  return (
    <div className="relative">
      {children}
      <div className="mt-2 flex items-start gap-2">
        <button
          type="button"
          onClick={() => setOuvert(!ouvert)}
          className={`text-[12px] flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
            hasRemarque
              ? "bg-statut-orange/10 text-statut-orange hover:bg-statut-orange/20"
              : "bg-gris-05 text-gris-60 hover:bg-gris-10 hover:text-gris-80"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          {hasRemarque ? "Remarque ajoutée" : "Ajouter remarque"}
        </button>
        {hasRemarque && !ouvert && (
          <span className="text-[12px] text-gris-60 italic truncate max-w-[200px]">
            {remarque}
          </span>
        )}
      </div>
      {ouvert && (
        <div className="mt-2 p-3 bg-statut-orange/5 border border-statut-orange/20 rounded-lg">
          <label className="block text-[12px] font-medium text-statut-orange mb-1">
            Remarque du manager sur ce champ
          </label>
          <textarea
            value={remarque}
            onChange={(e) => onUpdateRemarque(champId, e.target.value)}
            placeholder="Notez votre remarque, observation ou point d'attention..."
            rows={2}
            className="w-full px-3 py-2 rounded-md border border-statut-orange/30 bg-white text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-statut-orange/50 resize-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setOuvert(false)}
              className="text-[12px] text-gris-60 hover:text-gris-80"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher une évaluation avec étoiles (lecture seule)
function EvaluationDisplay({
  theme,
  score,
  commentaire,
}: {
  theme: string;
  score: number;
  commentaire?: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-gris-05 border border-gris-10">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[14px] font-medium text-noir">{theme}</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 ${star <= score ? "text-statut-orange" : "text-gris-20"}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      </div>
      {commentaire && (
        <p className="text-[13px] text-gris-60 mt-1">{commentaire}</p>
      )}
    </div>
  );
}

// Composant pour liste de points (lecture seule)
function ListePoints({
  points,
  variant = "default",
}: {
  points: string[];
  variant?: "success" | "warning" | "default";
}) {
  const colors = {
    success: "bg-statut-vert/10 border-statut-vert/20 text-statut-vert",
    warning: "bg-statut-orange/10 border-statut-orange/20 text-statut-orange",
    default: "bg-gris-05 border-gris-10 text-gris-60",
  };

  if (points.length === 0) {
    return (
      <div className="text-[13px] text-gris-40 italic">
        Aucun élément renseigné
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {points.map((point, index) => (
        <li
          key={index}
          className={`flex items-start gap-2 p-2 rounded-lg border ${colors[variant]}`}
        >
          <svg
            className="w-4 h-4 shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            {variant === "success" ? (
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            ) : variant === "warning" ? (
              <path
                fillRule="evenodd"
                d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                clipRule="evenodd"
              />
            ) : (
              <circle cx="10" cy="10" r="3" />
            )}
          </svg>
          <span className="flex-1 text-[14px] text-noir">{point}</span>
        </li>
      ))}
    </ul>
  );
}

export function VueEntretien({ entretien, initialWizard }: VueEntretienProps) {
  const [wizard, setWizard] = useState<WizardEntretienData>(initialWizard);
  const [notesSeance, setNotesSeance] = useState(initialWizard.session?.notesSeance ?? "");
  const [bilan, setBilan] = useState(initialWizard.session?.bilan ?? DEFAULT_BILAN);
  const [remarquesChamps, setRemarquesChamps] = useState<WizardRemarquesChamps>(
    initialWizard.session?.remarquesChamps || {}
  );
  const [enregistre, setEnregistre] = useState(false);

  // Charger depuis localStorage au montage
  useEffect(() => {
    const loaded = loadWizardFromStorage(entretien.id, initialWizard);
    setWizard(loaded);
    setNotesSeance(loaded.session?.notesSeance ?? "");
    setBilan(loaded.session?.bilan ?? DEFAULT_BILAN);
    setRemarquesChamps(loaded.session.remarquesChamps || {});
  }, [entretien.id, initialWizard]);

  const updateRemarque = (champId: string, remarque: string) => {
    setRemarquesChamps((prev) => ({
      ...prev,
      [champId]: remarque,
    }));
  };

  const handleSave = () => {
    const updated: WizardEntretienData = {
      ...wizard,
      session: {
        ...wizard.session,
        notesSeance,
        bilan,
        remarquesChamps,
      },
    };
    saveWizardToStorage(updated);
    setWizard(updated);
    setEnregistre(true);
    setTimeout(() => setEnregistre(false), 2000);
  };

  const ajouterPointAmeliorer = () => {
    setBilan((prev) => {
      const p = prev ?? DEFAULT_BILAN;
      return {
        ...p,
        pointsAmeliorer: [
          ...(p.pointsAmeliorer ?? []),
          { intitule: "", echeance: "", remarque: "" },
        ],
      };
    });
  };

  const supprimerPointAmeliorer = (index: number) => {
    setBilan((prev) => {
      const p = prev ?? DEFAULT_BILAN;
      return {
        ...p,
        pointsAmeliorer: (p.pointsAmeliorer ?? []).filter((_, i) => i !== index),
      };
    });
  };

  const updatePointAmeliorer = (
    index: number,
    field: keyof WizardPointAmeliorer,
    value: string
  ) => {
    setBilan((prev) => {
      const p = prev ?? DEFAULT_BILAN;
      return {
        ...p,
        pointsAmeliorer: (p.pointsAmeliorer ?? []).map((pi, i) =>
          i === index ? { ...pi, [field]: value } : pi
        ),
      };
    });
  };

  const { collaborateur, manager } = entretien;
  const preCollab = wizard.preCollaborateur;
  const preManager = wizard.preManager;

  // Compter le nombre de remarques
  const nbRemarques = Object.values(remarquesChamps).filter((r) => r.trim().length > 0).length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <header className="bg-white rounded-lg border border-gris-10 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TypeBadge type={entretien.type} />
              {nbRemarques > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-statut-orange/10 text-statut-orange text-[12px] font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  {nbRemarques} remarque{nbRemarques > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <h1 className="text-xl font-semibold text-applipro-dark">
              Entretien – {collaborateur.prenom} {collaborateur.nom}
            </h1>
            <p className="text-[14px] text-gris-60 mt-1">
              {formatDate(entretien.datePrevue)}
              {entretien.lieu && ` • ${entretien.lieu}`}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 text-[14px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-applipro-05 flex items-center justify-center text-applipro font-semibold shrink-0">
                {collaborateur.avatarUrl ? (
                  <Image
                    src={collaborateur.avatarUrl}
                    alt={`${collaborateur.prenom} ${collaborateur.nom}`}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {collaborateur.prenom.charAt(0)}
                    {collaborateur.nom.charAt(0)}
                  </>
                )}
              </div>
              <div>
                <p className="text-[12px] text-gris-60">Collaborateur</p>
                <p className="font-medium text-noir">
                  {collaborateur.prenom} {collaborateur.nom}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-applipro-05 flex items-center justify-center text-applipro font-semibold shrink-0">
                {manager.avatarUrl ? (
                  <Image
                    src={manager.avatarUrl}
                    alt={`${manager.prenom} ${manager.nom}`}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {manager.prenom.charAt(0)}
                    {manager.nom.charAt(0)}
                  </>
                )}
              </div>
              <div>
                <p className="text-[12px] text-gris-60">Manager</p>
                <p className="font-medium text-noir">
                  {manager.prenom} {manager.nom}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Deux colonnes : Préparations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne Collaborateur */}
        <div className="bg-white rounded-lg border border-gris-10 overflow-hidden">
          <div className="bg-applipro-05 px-4 py-3 border-b border-gris-10">
            <h2 className="font-semibold text-applipro-dark flex items-center gap-2">
              <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Préparation Collaborateur
            </h2>
          </div>
          <div className="p-4 space-y-5">
            {/* Ressenti général */}
            <ChampAvecRemarque
              champId="collab_ressenti"
              remarquesChamps={remarquesChamps}
              onUpdateRemarque={updateRemarque}
            >
              <div>
                <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Ressenti général
                </h3>
                <p className="text-[14px] text-noir bg-gris-05 rounded-lg p-3 border border-gris-10">
                  {preCollab?.ressentiGeneral || <span className="text-gris-40 italic">Non renseigné</span>}
                </p>
              </div>
            </ChampAvecRemarque>

            {/* Évaluations */}
            {(preCollab?.evaluations ?? []).length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Auto-évaluations
                </h3>
                <div className="space-y-3">
                  {(preCollab?.evaluations ?? []).map((ev, i) => (
                    <ChampAvecRemarque
                      key={i}
                      champId={`collab_evaluation:${i}`}
                      remarquesChamps={remarquesChamps}
                      onUpdateRemarque={updateRemarque}
                    >
                      <EvaluationDisplay
                        theme={ev.theme}
                        score={ev.score}
                        commentaire={ev.commentaireCollaborateur}
                      />
                    </ChampAvecRemarque>
                  ))}
                </div>
              </div>
            )}

            {/* Objectifs N-1 */}
            {(preCollab?.objectifsNMoins1 ?? []).length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Objectifs année passée
                </h3>
                <div className="space-y-3">
                  {(preCollab?.objectifsNMoins1 ?? []).map((obj, i) => (
                    <ChampAvecRemarque
                      key={i}
                      champId={`collab_objectif:${i}`}
                      remarquesChamps={remarquesChamps}
                      onUpdateRemarque={updateRemarque}
                    >
                      <div className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                        <p className="text-[14px] font-medium text-noir">{obj.intitule}</p>
                        {obj.echeance && (
                          <p className="text-[12px] text-gris-60 mt-0.5">
                            Échéance : {obj.echeance}
                          </p>
                        )}
                        {obj.avancementCollaborateur !== undefined && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gris-20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-applipro rounded-full"
                                style={{ width: `${obj.avancementCollaborateur}%` }}
                              />
                            </div>
                            <span className="text-[12px] font-medium text-applipro">
                              {obj.avancementCollaborateur}%
                            </span>
                          </div>
                        )}
                        {obj.commentaireCollaborateur && (
                          <p className="text-[13px] text-gris-60 mt-2 italic">
                            &quot;{obj.commentaireCollaborateur}&quot;
                          </p>
                        )}
                      </div>
                    </ChampAvecRemarque>
                  ))}
                </div>
              </div>
            )}

            {/* Besoins formation */}
            {(preCollab?.besoinsFormation ?? []).length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Besoins en formation
                </h3>
                <div className="space-y-3">
                  {(preCollab?.besoinsFormation ?? []).map((f, i) => (
                    <ChampAvecRemarque
                      key={i}
                      champId={`collab_formation:${i}`}
                      remarquesChamps={remarquesChamps}
                      onUpdateRemarque={updateRemarque}
                    >
                      <div className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                        <p className="text-[14px] text-noir">{f.intitule}</p>
                        {f.commentaire && (
                          <p className="text-[13px] text-gris-60 mt-1">{f.commentaire}</p>
                        )}
                      </div>
                    </ChampAvecRemarque>
                  ))}
                </div>
              </div>
            )}

            {/* Compétences */}
            {(preCollab?.competences ?? []).length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Compétences
                </h3>
                <div className="space-y-3">
                  {(preCollab?.competences ?? []).map((c, i) => (
                    <ChampAvecRemarque
                      key={i}
                      champId={`collab_competence:${i}`}
                      remarquesChamps={remarquesChamps}
                      onUpdateRemarque={updateRemarque}
                    >
                      <div className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                        <p className="text-[14px] font-medium text-noir">{c.competence}</p>
                        <div className="flex items-center gap-4 mt-2 text-[12px]">
                          <span className="text-gris-60">
                            Niveau attendu : <strong className="text-noir">{c.niveauAttendu}/5</strong>
                          </span>
                          <span className="text-gris-60">
                            Auto-évaluation : <strong className="text-applipro">{c.niveauCollaborateur}/5</strong>
                          </span>
                        </div>
                        {c.commentaire && (
                          <p className="text-[13px] text-gris-60 mt-1">{c.commentaire}</p>
                        )}
                      </div>
                    </ChampAvecRemarque>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne Manager */}
        <div className="bg-white rounded-lg border border-gris-10 overflow-hidden">
          <div className="bg-applipro-05 px-4 py-3 border-b border-gris-10">
            <h2 className="font-semibold text-applipro-dark flex items-center gap-2">
              <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Préparation Manager
            </h2>
          </div>
          <div className="p-4 space-y-5">
            {/* Synthèse */}
            <ChampAvecRemarque
              champId="manager_synthese"
              remarquesChamps={remarquesChamps}
              onUpdateRemarque={updateRemarque}
            >
              <div>
                <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Synthèse manager
                </h3>
                <p className="text-[14px] text-noir bg-gris-05 rounded-lg p-3 border border-gris-10">
                  {preManager?.syntheseManager || <span className="text-gris-40 italic">Non renseigné</span>}
                </p>
              </div>
            </ChampAvecRemarque>

            {/* Évaluations manager */}
            {(preManager?.evaluationsManager ?? []).length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Évaluations
                </h3>
                <div className="space-y-3">
                  {(preManager?.evaluationsManager ?? []).map((ev, i) => (
                    <ChampAvecRemarque
                      key={i}
                      champId={`manager_evaluation:${i}`}
                      remarquesChamps={remarquesChamps}
                      onUpdateRemarque={updateRemarque}
                    >
                      <EvaluationDisplay
                        theme={ev.theme}
                        score={ev.score}
                        commentaire={ev.commentaire}
                      />
                    </ChampAvecRemarque>
                  ))}
                </div>
              </div>
            )}

            {/* Points forts */}
            <div>
              <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                Points forts
              </h3>
              <div className="space-y-3">
                {(preManager?.pointsForts ?? []).map((point, i) => (
                  <ChampAvecRemarque
                    key={i}
                    champId={`manager_pointfort:${i}`}
                    remarquesChamps={remarquesChamps}
                    onUpdateRemarque={updateRemarque}
                  >
                    <div className="flex items-start gap-2 p-2 rounded-lg border bg-statut-vert/10 border-statut-vert/20">
                      <svg className="w-4 h-4 shrink-0 mt-0.5 text-statut-vert" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="flex-1 text-[14px] text-noir">{point}</span>
                    </div>
                  </ChampAvecRemarque>
                ))}
                {(preManager?.pointsForts ?? []).length === 0 && (
                  <div className="text-[13px] text-gris-40 italic">Aucun élément renseigné</div>
                )}
              </div>
            </div>

            {/* Axes de progrès */}
            <div>
              <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                Axes de progrès
              </h3>
              <div className="space-y-3">
                {(preManager?.axesProgres ?? []).map((axe, i) => (
                  <ChampAvecRemarque
                    key={i}
                    champId={`manager_axe:${i}`}
                    remarquesChamps={remarquesChamps}
                    onUpdateRemarque={updateRemarque}
                  >
                    <div className="flex items-start gap-2 p-2 rounded-lg border bg-statut-orange/10 border-statut-orange/20">
                      <svg className="w-4 h-4 shrink-0 mt-0.5 text-statut-orange" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      <span className="flex-1 text-[14px] text-noir">{axe}</span>
                    </div>
                  </ChampAvecRemarque>
                ))}
                {(preManager?.axesProgres ?? []).length === 0 && (
                  <div className="text-[13px] text-gris-40 italic">Aucun élément renseigné</div>
                )}
              </div>
            </div>

            {/* Besoins formation manager */}
            {preManager?.besoinsFormationManager && (
              <ChampAvecRemarque
                champId="manager_formation"
                remarquesChamps={remarquesChamps}
                onUpdateRemarque={updateRemarque}
              >
                <div>
                  <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                    Besoins en formation identifiés
                  </h3>
                  <p className="text-[14px] text-noir bg-gris-05 rounded-lg p-3 border border-gris-10">
                    {preManager?.besoinsFormationManager}
                  </p>
                </div>
              </ChampAvecRemarque>
            )}

            {/* Notes préparatoires */}
            {preManager?.notesPreparatoires && (
              <ChampAvecRemarque
                champId="manager_notes"
                remarquesChamps={remarquesChamps}
                onUpdateRemarque={updateRemarque}
              >
                <div>
                  <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                    Notes préparatoires
                  </h3>
                  <p className="text-[14px] text-noir bg-gris-05 rounded-lg p-3 border border-gris-10 italic">
                    {preManager?.notesPreparatoires}
                  </p>
                </div>
              </ChampAvecRemarque>
            )}
          </div>
        </div>
      </div>

      {/* Notes de séance */}
      <section className="bg-white rounded-lg border border-gris-10 p-6">
        <h2 className="text-base font-semibold text-applipro-dark flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Notes de séance
        </h2>
        <p className="text-[13px] text-gris-60 mb-3">
          Prenez des notes en temps réel pendant l&apos;entretien.
        </p>
        <textarea
          value={notesSeance}
          onChange={(e) => setNotesSeance(e.target.value)}
          placeholder="Notez ici les points clés abordés pendant l'entretien, les décisions prises, les engagements mutuels..."
          rows={6}
          className="w-full px-4 py-3 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[14px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
        />
      </section>

      {/* Bilan de fin d'entretien */}
      <section className="bg-white rounded-lg border border-gris-10 p-6">
        <h2 className="text-base font-semibold text-applipro-dark flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Bilan de fin d&apos;entretien
        </h2>

        {/* Synthèse globale */}
        <div className="mb-6">
          <label className="block text-[14px] font-medium text-noir mb-2">
            Synthèse globale
          </label>
          <textarea
            value={bilan?.syntheseGlobale ?? ""}
            onChange={(e) => setBilan((prev) => ({ ...(prev ?? DEFAULT_BILAN), syntheseGlobale: e.target.value }))}
            placeholder="Résumé global de l'entretien, conclusions principales..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[14px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
          />
        </div>

        {/* Points à améliorer */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[14px] font-medium text-noir">
              Points à améliorer
            </label>
            <button
              type="button"
              onClick={ajouterPointAmeliorer}
              className="text-[13px] text-applipro hover:text-applipro/80 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un point
            </button>
          </div>

          {(bilan?.pointsAmeliorer ?? []).length === 0 ? (
            <p className="text-[13px] text-gris-40 italic p-4 bg-gris-05 rounded-lg border border-gris-10">
              Aucun point à améliorer défini. Cliquez sur &quot;Ajouter un point&quot; pour en créer.
            </p>
          ) : (
            <div className="space-y-3">
              {(bilan?.pointsAmeliorer ?? []).map((point, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gris-05 border border-gris-10 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={point.intitule}
                        onChange={(e) => updatePointAmeliorer(index, "intitule", e.target.value)}
                        placeholder="Intitulé"
                        className="px-3 py-2 rounded-lg border border-gris-20 bg-white text-[14px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
                      />
                      <input
                        type="text"
                        value={point.echeance || ""}
                        onChange={(e) => updatePointAmeliorer(index, "echeance", e.target.value)}
                        placeholder="Échéance (ex: 2025-06-30)"
                        className="px-3 py-2 rounded-lg border border-gris-20 bg-white text-[14px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
                      />
                      <input
                        type="text"
                        value={point.remarque || ""}
                        onChange={(e) => updatePointAmeliorer(index, "remarque", e.target.value)}
                        placeholder="Remarque"
                        className="px-3 py-2 rounded-lg border border-gris-20 bg-white text-[14px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => supprimerPointAmeliorer(index)}
                      className="p-2 text-gris-40 hover:text-statut-rouge transition-colors"
                      aria-label="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Remarques */}
      <section className="bg-white rounded-lg border border-gris-10 p-6">
        <h2 className="text-base font-semibold text-applipro-dark flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Remarques
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[14px] font-medium text-noir mb-2">
              Remarques du collaborateur
            </label>
            <textarea
              value={bilan?.remarquesCollaborateur ?? ""}
              onChange={(e) =>
                setBilan((prev) => ({ ...(prev ?? DEFAULT_BILAN), remarquesCollaborateur: e.target.value }))
              }
              placeholder="Commentaires du collaborateur sur l'entretien..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[14px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
            />
          </div>
          <div>
            <label className="block text-[14px] font-medium text-noir mb-2">
              Remarques du manager
            </label>
            <textarea
              value={bilan?.remarquesManager ?? ""}
              onChange={(e) =>
                setBilan((prev) => ({ ...(prev ?? DEFAULT_BILAN), remarquesManager: e.target.value }))
              }
              placeholder="Commentaires du manager sur l'entretien..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[14px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
            />
          </div>
        </div>
      </section>

      {/* Bouton enregistrer */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="primary"
          size="regular"
          onClick={handleSave}
          className="min-w-[200px]"
        >
          {enregistre ? "Bilan enregistré ✓" : "Enregistrer le bilan"}
        </Button>
      </div>
    </div>
  );
}
