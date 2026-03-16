"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { EntretienWithDetails } from "@/lib/types";
import type {
  WizardEntretienData,
  WizardPointAmeliorer,
  SignalRhCategorie,
} from "@/lib/wizardData";
import {
  loadWizardFromStorage,
  saveWizardToStorage,
  SIGNAL_RH_CATEGORIES,
} from "@/lib/wizardData";
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

function formatDateTime(s: string) {
  return new Date(s).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
        <span className="text-[13px] font-medium text-noir">{theme}</span>
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
        <p className="text-[12px] text-gris-60 mt-1">{commentaire}</p>
      )}
    </div>
  );
}

// Étoiles cliquables pour le feedback
function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: 1 | 2 | 3 | 4 | 5) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {([1, 2, 3, 4, 5] as const).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
        >
          <svg
            className={`w-6 h-6 ${star <= value ? "text-statut-orange" : "text-gris-20"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function VueEntretien({ entretien, initialWizard }: VueEntretienProps) {
  const [wizard, setWizard] = useState<WizardEntretienData>(initialWizard);
  const [notesSeance, setNotesSeance] = useState(initialWizard.session?.notesSeance ?? "");
  const [bilan, setBilan] = useState(initialWizard.session?.bilan ?? DEFAULT_BILAN);
  const [enregistre, setEnregistre] = useState(false);

  // Charger depuis localStorage au montage
  useEffect(() => {
    const loaded = loadWizardFromStorage(entretien.id, initialWizard);
    setWizard(loaded);
    setNotesSeance(loaded.session?.notesSeance ?? "");
    setBilan(loaded.session?.bilan ?? DEFAULT_BILAN);
  }, [entretien.id, initialWizard]);

  const updateWizard = (updater: (prev: WizardEntretienData) => WizardEntretienData) => {
    setWizard((prev) => {
      const next = updater(prev);
      saveWizardToStorage(next);
      return next;
    });
  };

  const handleSave = () => {
    const updated: WizardEntretienData = {
      ...wizard,
      session: {
        ...wizard.session,
        notesSeance,
        bilan,
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
  const validation = wizard.validation;
  const signauxRh = wizard.session.signauxRh ?? [];

  // Détecter les divergences : comparaison par nom de thème
  const desaccords: { theme: string; scoreCollab: number; scoreManager: number; ecart: number }[] = [];
  for (const evalCollab of preCollab?.evaluations ?? []) {
    const evalManager = (preManager?.evaluationsManager ?? []).find(
      (em) => em.theme === evalCollab.theme
    );
    if (evalManager) {
      const ecart = Math.abs(evalCollab.score - evalManager.score);
      if (ecart >= 1) {
        desaccords.push({
          theme: evalCollab.theme,
          scoreCollab: evalCollab.score,
          scoreManager: evalManager.score,
          ecart,
        });
      }
    }
  }

  const isSigned = validation.statutSignatureCollaborateur === "valide" && validation.statutValidationManager === "valide";
  const isRefused = validation.statutSignatureCollaborateur === "refuse";

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <header className="bg-white rounded-lg border border-gris-10 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TypeBadge type={entretien.type} />
              {isRefused && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-statut-rouge/10 text-statut-rouge text-[12px] font-semibold">
                  Signature refusée
                </span>
              )}
              {isSigned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-statut-vert/10 text-statut-vert text-[12px] font-semibold">
                  Signé par les deux parties
                </span>
              )}
            </div>
            <h1 className="text-xl font-semibold text-applipro-dark">
              Entretien – {collaborateur.prenom} {collaborateur.nom}
            </h1>
            <p className="text-[14px] text-gris-60 mt-1">
              {formatDate(entretien.datePrevue)}
              {entretien.heurePrevue && ` à ${entretien.heurePrevue}`}
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

      {/* Trois colonnes : Préparation Collaborateur | Préparation Manager | Synthèse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Colonne 1 : Préparation Collaborateur ─── */}
        <div className="bg-white rounded-lg border border-gris-10 overflow-hidden">
          <div className="bg-applipro-05 px-4 py-3 border-b border-gris-10">
            <h2 className="font-semibold text-applipro-dark flex items-center gap-2 text-[14px]">
              <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Préparation Collaborateur
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Ressenti général */}
            <div>
              <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-1">Ressenti général</h3>
              <p className="text-[13px] text-noir bg-gris-05 rounded-lg p-3 border border-gris-10">
                {preCollab?.ressentiGeneral || <span className="text-gris-40 italic">Non renseigné</span>}
              </p>
            </div>

            {/* Évaluations */}
            {(preCollab?.evaluations ?? []).length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Auto-évaluations</h3>
                <div className="space-y-2">
                  {(preCollab?.evaluations ?? []).map((ev, i) => (
                    <EvaluationDisplay key={i} theme={ev.theme} score={ev.score} commentaire={ev.commentaireCollaborateur} />
                  ))}
                </div>
              </div>
            )}

            {/* Objectifs N-1 */}
            {(preCollab?.objectifsNMoins1 ?? []).length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Objectifs année passée</h3>
                <div className="space-y-2">
                  {(preCollab?.objectifsNMoins1 ?? []).map((obj, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                      <p className="text-[13px] font-medium text-noir">{obj.intitule}</p>
                      {obj.echeance && <p className="text-[11px] text-gris-60 mt-0.5">Échéance : {obj.echeance}</p>}
                      {obj.avancementCollaborateur !== undefined && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gris-20 rounded-full overflow-hidden">
                            <div className="h-full bg-applipro rounded-full" style={{ width: `${obj.avancementCollaborateur}%` }} />
                          </div>
                          <span className="text-[11px] font-medium text-applipro">{obj.avancementCollaborateur}%</span>
                        </div>
                      )}
                      {obj.commentaireCollaborateur && (
                        <p className="text-[12px] text-gris-60 mt-2 italic">&quot;{obj.commentaireCollaborateur}&quot;</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Besoins formation */}
            {(preCollab?.besoinsFormation ?? []).length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Besoins en formation</h3>
                <div className="space-y-2">
                  {(preCollab?.besoinsFormation ?? []).map((f, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                      <p className="text-[13px] text-noir">{f.intitule}</p>
                      {f.commentaire && <p className="text-[12px] text-gris-60 mt-1">{f.commentaire}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compétences */}
            {(preCollab?.competences ?? []).length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Compétences</h3>
                <div className="space-y-2">
                  {(preCollab?.competences ?? []).map((c, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                      <p className="text-[13px] font-medium text-noir">{c.competence}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px]">
                        <span className="text-gris-60">Attendu : <strong className="text-noir">{c.niveauAttendu}/5</strong></span>
                        <span className="text-gris-60">Auto-éval : <strong className="text-applipro">{c.niveauCollaborateur}/5</strong></span>
                      </div>
                      {c.commentaire && <p className="text-[12px] text-gris-60 mt-1">{c.commentaire}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Colonne 2 : Préparation Manager ─── */}
        <div className="bg-white rounded-lg border border-gris-10 overflow-hidden">
          <div className="bg-applipro-05 px-4 py-3 border-b border-gris-10">
            <h2 className="font-semibold text-applipro-dark flex items-center gap-2 text-[14px]">
              <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Préparation Manager
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Synthèse */}
            <div>
              <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-1">Synthèse manager</h3>
              <p className="text-[13px] text-noir bg-gris-05 rounded-lg p-3 border border-gris-10">
                {preManager?.syntheseManager || <span className="text-gris-40 italic">Non renseigné</span>}
              </p>
            </div>

            {/* Évaluations manager */}
            {(preManager?.evaluationsManager ?? []).length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Évaluations</h3>
                <div className="space-y-2">
                  {(preManager?.evaluationsManager ?? []).map((ev, i) => (
                    <EvaluationDisplay key={i} theme={ev.theme} score={ev.score} commentaire={ev.commentaire} />
                  ))}
                </div>
              </div>
            )}

            {/* Points forts */}
            {(preManager?.pointsForts ?? []).length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Points forts</h3>
                <div className="space-y-2">
                  {(preManager?.pointsForts ?? []).map((point, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg border bg-statut-vert/10 border-statut-vert/20">
                      <svg className="w-4 h-4 shrink-0 mt-0.5 text-statut-vert" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="flex-1 text-[13px] text-noir">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Axes de progrès */}
            {(preManager?.axesProgres ?? []).length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Axes de progrès</h3>
                <div className="space-y-2">
                  {(preManager?.axesProgres ?? []).map((axe, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg border bg-statut-orange/10 border-statut-orange/20">
                      <svg className="w-4 h-4 shrink-0 mt-0.5 text-statut-orange" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      <span className="flex-1 text-[13px] text-noir">{axe}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Besoins formation manager */}
            {preManager?.besoinsFormationManager && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-1">Besoins en formation</h3>
                <p className="text-[13px] text-noir bg-gris-05 rounded-lg p-3 border border-gris-10">
                  {preManager?.besoinsFormationManager}
                </p>
              </div>
            )}

            {/* Notes préparatoires */}
            {preManager?.notesPreparatoires && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-1">Notes préparatoires</h3>
                <p className="text-[13px] text-noir bg-gris-05 rounded-lg p-3 border border-gris-10 italic">
                  {preManager?.notesPreparatoires}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Colonne 3 : Synthèse co-construite ─── */}
        <div className="bg-white rounded-lg border border-applipro/20 overflow-hidden">
          <div className="bg-applipro/10 px-4 py-3 border-b border-applipro/20">
            <h2 className="font-semibold text-applipro-dark flex items-center gap-2 text-[14px]">
              <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Synthèse co-construite
            </h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Points de désaccord */}
            {desaccords.length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-statut-orange uppercase tracking-wide mb-2">
                  Divergences de notation ({desaccords.length})
                </h3>
                <div className="space-y-2">
                  {desaccords.map((d, i) => {
                    const isMajor = d.ecart >= 2;
                    const bgColor = isMajor ? "bg-statut-rouge/10 border-statut-rouge/20" : "bg-statut-orange/10 border-statut-orange/20";
                    const iconColor = isMajor ? "text-statut-rouge" : "text-statut-orange";
                    return (
                      <div key={i} className={`px-3 py-2 rounded-lg ${bgColor} border`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <svg className={`w-4 h-4 ${iconColor} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <p className="text-[13px] font-medium text-noir flex-1">{d.theme}</p>
                          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                            isMajor ? "bg-statut-rouge/20 text-statut-rouge" : "bg-statut-orange/20 text-statut-orange"
                          }`}>
                            {isMajor ? `Écart fort (${d.ecart})` : `Écart (${d.ecart})`}
                          </span>
                        </div>
                        <div className="space-y-1 pl-6">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gris-60 w-24 shrink-0">Collaborateur</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className={`w-3.5 h-3.5 ${star <= d.scoreCollab ? "text-statut-orange" : "text-gris-20"}`} fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gris-60 w-24 shrink-0">Manager</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className={`w-3.5 h-3.5 ${star <= d.scoreManager ? "text-statut-orange" : "text-gris-20"}`} fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes de séance */}
            <div>
              <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2 flex items-center gap-1">
                <svg className="w-4 h-4 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Notes de séance
              </h3>
              <textarea
                value={notesSeance}
                onChange={(e) => setNotesSeance(e.target.value)}
                placeholder="Notez les points clés abordés pendant l'entretien..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
              />
            </div>

            {/* Bilan - Synthèse globale */}
            <div>
              <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Synthèse globale</h3>
              <textarea
                value={bilan?.syntheseGlobale ?? ""}
                onChange={(e) => setBilan((prev) => ({ ...(prev ?? DEFAULT_BILAN), syntheseGlobale: e.target.value }))}
                placeholder="Résumé global de l'entretien..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
              />
            </div>

            {/* Points à améliorer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide">Points à améliorer</h3>
                <button
                  type="button"
                  onClick={ajouterPointAmeliorer}
                  className="text-[12px] text-applipro hover:text-applipro/80 font-medium flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter
                </button>
              </div>

              {(bilan?.pointsAmeliorer ?? []).length === 0 ? (
                <p className="text-[12px] text-gris-40 italic p-3 bg-gris-05 rounded-lg border border-gris-10">
                  Aucun point à améliorer défini.
                </p>
              ) : (
                <div className="space-y-2">
                  {(bilan?.pointsAmeliorer ?? []).map((point, index) => (
                    <div key={index} className="p-3 rounded-lg bg-gris-05 border border-gris-10 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={point.intitule}
                          onChange={(e) => updatePointAmeliorer(index, "intitule", e.target.value)}
                          placeholder="Intitulé"
                          className="flex-1 px-2 py-1.5 rounded border border-gris-20 bg-white text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
                        />
                        <button type="button" onClick={() => supprimerPointAmeliorer(index)} className="p-1 text-gris-40 hover:text-statut-rouge">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={point.echeance || ""}
                        onChange={(e) => updatePointAmeliorer(index, "echeance", e.target.value)}
                        placeholder="Échéance"
                        className="w-full px-2 py-1.5 rounded border border-gris-20 bg-white text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
                      />
                      <input
                        type="text"
                        value={point.remarque || ""}
                        onChange={(e) => updatePointAmeliorer(index, "remarque", e.target.value)}
                        placeholder="Remarque"
                        className="w-full px-2 py-1.5 rounded border border-gris-20 bg-white text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Remarques */}
            <div>
              <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Remarques du collaborateur</h3>
              <textarea
                value={bilan?.remarquesCollaborateur ?? ""}
                onChange={(e) => setBilan((prev) => ({ ...(prev ?? DEFAULT_BILAN), remarquesCollaborateur: e.target.value }))}
                placeholder="Commentaires du collaborateur..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
              />
            </div>
            <div>
              <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Remarques du manager</h3>
              <textarea
                value={bilan?.remarquesManager ?? ""}
                onChange={(e) => setBilan((prev) => ({ ...(prev ?? DEFAULT_BILAN), remarquesManager: e.target.value }))}
                placeholder="Commentaires du manager..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
              />
            </div>

            {/* Bouton enregistrer */}
            <Button type="button" variant="primary" size="regular" onClick={handleSave} className="w-full">
              {enregistre ? "Bilan enregistré ✓" : "Enregistrer le bilan"}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Section Signature ─── */}
      <section className="bg-white rounded-lg border border-gris-10 p-6">
        <h2 className="text-base font-semibold text-applipro-dark flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Signature de l&apos;entretien
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Signature Manager */}
          <div className="p-4 rounded-lg border border-gris-10 bg-gris-05">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-medium text-noir">Manager</h3>
              {validation.statutValidationManager === "valide" ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-statut-vert/10 text-statut-vert text-[12px] font-semibold">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Signé
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gris-10 text-gris-60 text-[12px] font-medium">
                  En attente
                </span>
              )}
            </div>
            {validation.dateSignatureManager && (
              <p className="text-[12px] text-gris-60">
                Signé le {formatDateTime(validation.dateSignatureManager)}
              </p>
            )}
            {validation.statutValidationManager === "en_attente" && (
              <Button
                type="button"
                variant="primary"
                size="small"
                className="mt-3"
                onClick={() => {
                  updateWizard((prev) => ({
                    ...prev,
                    validation: {
                      ...prev.validation,
                      statutValidationManager: "valide",
                      dateSignatureManager: new Date().toISOString(),
                    },
                  }));
                }}
              >
                Signer (Manager)
              </Button>
            )}
          </div>

          {/* Signature Collaborateur */}
          <div className="p-4 rounded-lg border border-gris-10 bg-gris-05">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-medium text-noir">Collaborateur</h3>
              {validation.statutSignatureCollaborateur === "valide" ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-statut-vert/10 text-statut-vert text-[12px] font-semibold">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Signé
                </span>
              ) : validation.statutSignatureCollaborateur === "refuse" ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-statut-rouge/10 text-statut-rouge text-[12px] font-semibold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Refusé
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gris-10 text-gris-60 text-[12px] font-medium">
                  En attente
                </span>
              )}
            </div>
            {validation.dateSignatureCollaborateur && (
              <p className="text-[12px] text-gris-60">
                {validation.statutSignatureCollaborateur === "refuse" ? "Refusé" : "Signé"} le {formatDateTime(validation.dateSignatureCollaborateur)}
              </p>
            )}
            {validation.motifRefusCollaborateur && (
              <div className="mt-2 p-3 bg-statut-rouge/5 border border-statut-rouge/20 rounded-lg">
                <p className="text-[12px] font-medium text-statut-rouge mb-1">Motif du refus</p>
                <p className="text-[13px] text-noir">{validation.motifRefusCollaborateur}</p>
              </div>
            )}
            {validation.statutSignatureCollaborateur === "en_attente" && (
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="small"
                  onClick={() => {
                    updateWizard((prev) => ({
                      ...prev,
                      validation: {
                        ...prev.validation,
                        statutSignatureCollaborateur: "valide",
                        dateSignatureCollaborateur: new Date().toISOString(),
                      },
                    }));
                  }}
                >
                  Signer
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    const motif = prompt("Motif du refus de signature :");
                    if (motif !== null) {
                      updateWizard((prev) => ({
                        ...prev,
                        validation: {
                          ...prev.validation,
                          statutSignatureCollaborateur: "refuse",
                          dateSignatureCollaborateur: new Date().toISOString(),
                          motifRefusCollaborateur: motif || "Aucun motif précisé",
                        },
                      }));
                    }
                  }}
                >
                  Refuser de signer
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Remarques du collaborateur pour signature */}
        {validation.remarquesCollaborateur && (
          <div className="mt-4 p-3 bg-gris-05 border border-gris-10 rounded-lg">
            <p className="text-[12px] font-medium text-gris-80 mb-1">Remarques du collaborateur</p>
            <p className="text-[13px] text-noir">{validation.remarquesCollaborateur}</p>
          </div>
        )}
      </section>

      {/* ─── Section Signaux RH ─── */}
      <section className="bg-white rounded-lg border border-gris-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-applipro-dark flex items-center gap-2">
            <svg className="w-5 h-5 text-statut-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Signaler à la RH
            {signauxRh.filter((s) => s.actif).length > 0 && (
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-statut-orange/10 text-statut-orange border border-statut-orange/20">
                {signauxRh.filter((s) => s.actif).length} signalement{signauxRh.filter((s) => s.actif).length > 1 ? "s" : ""} actif{signauxRh.filter((s) => s.actif).length > 1 ? "s" : ""}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => {
              updateWizard((prev) => ({
                ...prev,
                session: {
                  ...prev.session,
                  signauxRh: [...(prev.session.signauxRh ?? []), { actif: true }],
                },
              }));
            }}
            className="text-[13px] font-medium text-statut-orange hover:text-statut-orange/80 flex items-center gap-1 px-3 py-1.5 rounded-applipro border border-statut-orange/30 bg-statut-orange/5 hover:bg-statut-orange/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un signal
          </button>
        </div>

        {signauxRh.length === 0 ? (
          <p className="text-[14px] text-gris-40 italic">Aucun signalement RH pour cet entretien.</p>
        ) : (
          <div className="space-y-3">
            {signauxRh.map((signal, idx) => (
              <div key={idx} className="border-l-4 border-l-statut-orange border border-gris-10 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-noir">Signal {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      updateWizard((prev) => ({
                        ...prev,
                        session: {
                          ...prev.session,
                          signauxRh: (prev.session.signauxRh ?? []).filter((_, i) => i !== idx),
                        },
                      }));
                    }}
                    className="text-gris-40 hover:text-statut-rouge transition-colors p-1"
                    title="Supprimer ce signal"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-noir mb-1">Catégorie</label>
                  <select
                    value={signal.categorie ?? ""}
                    onChange={(e) => {
                      updateWizard((prev) => {
                        const updated = [...(prev.session.signauxRh ?? [])];
                        updated[idx] = { ...updated[idx], categorie: (e.target.value || undefined) as SignalRhCategorie | undefined };
                        return { ...prev, session: { ...prev.session, signauxRh: updated } };
                      });
                    }}
                    className="w-full h-9 px-3 rounded-applipro border border-gris-20 bg-white text-[13px] text-noir focus:outline-none focus:ring-2 focus:ring-applipro"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {SIGNAL_RH_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-noir mb-1">Commentaire</label>
                  <textarea
                    value={signal.commentaire ?? ""}
                    onChange={(e) => {
                      updateWizard((prev) => {
                        const updated = [...(prev.session.signauxRh ?? [])];
                        updated[idx] = { ...updated[idx], commentaire: e.target.value };
                        return { ...prev, session: { ...prev.session, signauxRh: updated } };
                      });
                    }}
                    placeholder="Précisez le contexte du signalement..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Section Feedback post-entretien ─── */}
      {(isSigned || isRefused) && (
        <section className="bg-white rounded-lg border border-gris-10 p-6">
          <h2 className="text-base font-semibold text-applipro-dark flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Feedback post-entretien
          </h2>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-[14px] text-noir">Note :</span>
            <StarRating
              value={validation.feedbackNote ?? 0}
              onChange={(v) => {
                updateWizard((prev) => ({
                  ...prev,
                  validation: { ...prev.validation, feedbackNote: v },
                }));
              }}
            />
            {validation.feedbackNote && (
              <span className="text-[14px] font-semibold text-applipro">{validation.feedbackNote}/5</span>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-noir mb-1">Commentaire</label>
            <textarea
              value={validation.feedbackCommentaire ?? ""}
              onChange={(e) => {
                updateWizard((prev) => ({
                  ...prev,
                  validation: { ...prev.validation, feedbackCommentaire: e.target.value },
                }));
              }}
              placeholder="Partagez votre ressenti sur le déroulement de l'entretien..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
            />
          </div>
        </section>
      )}
    </div>
  );
}
