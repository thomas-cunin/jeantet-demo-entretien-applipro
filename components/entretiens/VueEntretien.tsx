"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { EntretienWithDetails } from "@/lib/types";
import type {
  WizardEntretienData,
  WizardPointAmeliorer,
  WizardNotationSynthese,
  WizardObjectifSynthese,
  WizardCompetenceSynthese,
} from "@/lib/wizardData";
import {
  loadWizardFromStorage,
  saveWizardToStorage,
  normalizeBesoinsFormationManager,
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

// Petites étoiles en lecture seule inline
function MiniStars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= value ? "text-statut-orange" : "text-gris-20"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function VueEntretien({ entretien, initialWizard }: VueEntretienProps) {
  const [wizard, setWizard] = useState<WizardEntretienData>(initialWizard);
  const [notesSeance, setNotesSeance] = useState(initialWizard.session?.notesSeance ?? "");
  const [bilan, setBilan] = useState(initialWizard.session?.bilan ?? DEFAULT_BILAN);
  const [enregistre, setEnregistre] = useState(false);

  // Nouveaux états pour la synthèse co-construite
  const [notationsSynthese, setNotationsSynthese] = useState<Record<string, WizardNotationSynthese>>(
    initialWizard.session?.notationsSynthese ?? {}
  );
  const [objectifsSynthese, setObjectifsSynthese] = useState<Record<string, WizardObjectifSynthese>>(
    initialWizard.session?.objectifsSynthese ?? {}
  );
  const [competencesSynthese, setCompetencesSynthese] = useState<Record<string, WizardCompetenceSynthese>>(
    initialWizard.session?.competencesSynthese ?? {}
  );
  const [formationsSelectionnees, setFormationsSelectionnees] = useState<string[]>(
    initialWizard.session?.formationsSelectionnees ?? []
  );
  const [pointsFortsCommentaire, setPointsFortsCommentaire] = useState(
    initialWizard.session?.pointsFortsCommentaire ?? ""
  );
  const [axesProgresCommentaire, setAxesProgresCommentaire] = useState(
    initialWizard.session?.axesProgresCommentaire ?? ""
  );

  // Charger depuis localStorage au montage
  useEffect(() => {
    const loaded = loadWizardFromStorage(entretien.id, initialWizard);
    setWizard(loaded);
    setNotesSeance(loaded.session?.notesSeance ?? "");
    setBilan(loaded.session?.bilan ?? DEFAULT_BILAN);
    setNotationsSynthese(loaded.session?.notationsSynthese ?? {});
    setObjectifsSynthese(loaded.session?.objectifsSynthese ?? {});
    setCompetencesSynthese(loaded.session?.competencesSynthese ?? {});
    setFormationsSelectionnees(loaded.session?.formationsSelectionnees ?? []);
    setPointsFortsCommentaire(loaded.session?.pointsFortsCommentaire ?? "");
    setAxesProgresCommentaire(loaded.session?.axesProgresCommentaire ?? "");
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
        notationsSynthese,
        objectifsSynthese,
        competencesSynthese,
        formationsSelectionnees,
        pointsFortsCommentaire,
        axesProgresCommentaire,
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

  // Normaliser besoinsFormationManager (migration string → string[])
  const besoinsFormationManagerList = normalizeBesoinsFormationManager(preManager?.besoinsFormationManager);

  // Comparer évaluations par thème (toutes, pas seulement les divergences)
  const evaluationComparisons: { theme: string; scoreCollab: number; scoreManager: number; ecart: number }[] = [];
  for (const evalCollab of preCollab?.evaluations ?? []) {
    const evalManager = (preManager?.evaluationsManager ?? []).find(
      (em) => em.theme === evalCollab.theme
    );
    if (evalManager) {
      evaluationComparisons.push({
        theme: evalCollab.theme,
        scoreCollab: evalCollab.score,
        scoreManager: evalManager.score,
        ecart: Math.abs(evalCollab.score - evalManager.score),
      });
    }
  }

  // Liste fusionnée des formations (collab + manager)
  const allFormations: { intitule: string; origine: "collaborateur" | "manager" }[] = [];
  for (const f of preCollab?.besoinsFormation ?? []) {
    allFormations.push({ intitule: f.intitule, origine: "collaborateur" });
  }
  for (const f of besoinsFormationManagerList) {
    allFormations.push({ intitule: f, origine: "manager" });
  }

  const toggleFormationSelectionnee = (intitule: string) => {
    setFormationsSelectionnees((prev) =>
      prev.includes(intitule) ? prev.filter((f) => f !== intitule) : [...prev, intitule]
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <header className="bg-white rounded-lg border border-gris-10 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TypeBadge type={entretien.type} />
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
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Évaluations</h3>
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

            {/* Besoins en formation */}
            {(preCollab?.besoinsFormation ?? []).length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Besoins en formation</h3>
                <div className="space-y-1">
                  {(preCollab?.besoinsFormation ?? []).map((f, i) => (
                    <p key={i} className="text-[13px] text-noir pl-3 border-l-2 border-applipro/30 py-1">
                      {f.intitule}
                    </p>
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

            {/* Objectifs N-1 (vue manager) */}
            {(preCollab?.objectifsNMoins1 ?? []).some((obj) => obj.avancementManager !== undefined) && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Objectifs année passée</h3>
                <div className="space-y-2">
                  {(preCollab?.objectifsNMoins1 ?? []).filter((obj) => obj.avancementManager !== undefined).map((obj, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                      <p className="text-[13px] font-medium text-noir">{obj.intitule}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gris-20 rounded-full overflow-hidden">
                          <div className="h-full bg-applipro-dark rounded-full" style={{ width: `${obj.avancementManager}%` }} />
                        </div>
                        <span className="text-[11px] font-medium text-applipro-dark">{obj.avancementManager}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compétences (vue manager) */}
            {(preCollab?.competences ?? []).some((c) => c.niveauManager !== undefined) && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Compétences</h3>
                <div className="space-y-2">
                  {(preCollab?.competences ?? []).filter((c) => c.niveauManager !== undefined).map((c, i) => (
                    <div key={i} className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                      <p className="text-[13px] font-medium text-noir">{c.competence}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px]">
                        <span className="text-gris-60">Attendu : <strong className="text-noir">{c.niveauAttendu}/5</strong></span>
                        <span className="text-gris-60">Manager : <strong className="text-applipro-dark">{c.niveauManager}/5</strong></span>
                      </div>
                      {c.commentaireManager && <p className="text-[12px] text-gris-60 mt-1">{c.commentaireManager}</p>}
                    </div>
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

            {/* Besoins formation manager — liste */}
            {besoinsFormationManagerList.length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">Besoins en formation</h3>
                <div className="space-y-1">
                  {besoinsFormationManagerList.map((f, i) => (
                    <p key={i} className="text-[13px] text-noir pl-3 border-l-2 border-applipro-dark/30 py-1">
                      {f}
                    </p>
                  ))}
                </div>
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

            {/* 1. Notations co-construites */}
            {evaluationComparisons.length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Notations co-construites
                </h3>
                <div className="space-y-3">
                  {evaluationComparisons.map((comp, i) => {
                    const hasEcart = comp.ecart >= 1;
                    const isMajor = comp.ecart >= 2;
                    const synthese = notationsSynthese[comp.theme];
                    const defaultScore = hasEcart ? 0 : comp.scoreCollab;

                    return (
                      <div key={i} className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[13px] font-medium text-noir">{comp.theme}</span>
                          {hasEcart && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              isMajor ? "bg-statut-rouge/15 text-statut-rouge" : "bg-statut-orange/15 text-statut-orange"
                            }`}>
                              {isMajor ? `Écart fort (${comp.ecart})` : `Écart (${comp.ecart})`}
                            </span>
                          )}
                        </div>

                        {hasEcart && (
                          <div className="space-y-1 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gris-60 w-24 shrink-0">Collaborateur</span>
                              <MiniStars value={comp.scoreCollab} />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gris-60 w-24 shrink-0">Manager</span>
                              <MiniStars value={comp.scoreManager} />
                            </div>
                          </div>
                        )}

                        {/* Note de synthèse éditable */}
                        <div className={hasEcart ? "pt-2 border-t border-gris-10" : ""}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-semibold text-applipro">Synthèse</span>
                            <StarRating
                              value={synthese?.score ?? defaultScore}
                              onChange={(v) => {
                                setNotationsSynthese((prev) => ({
                                  ...prev,
                                  [comp.theme]: {
                                    ...prev[comp.theme],
                                    score: v,
                                    commentaire: prev[comp.theme]?.commentaire ?? "",
                                  },
                                }));
                              }}
                            />
                          </div>
                          <input
                            type="text"
                            value={synthese?.commentaire ?? ""}
                            onChange={(e) => {
                              setNotationsSynthese((prev) => ({
                                ...prev,
                                [comp.theme]: {
                                  ...prev[comp.theme],
                                  score: prev[comp.theme]?.score ?? (defaultScore as 1 | 2 | 3 | 4 | 5),
                                  commentaire: e.target.value,
                                },
                              }));
                            }}
                            placeholder="Commentaire de synthèse..."
                            className="w-full px-2 py-1 rounded border border-gris-20 bg-white text-[12px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Objectifs N-1 — Synthèse */}
            {(preCollab?.objectifsNMoins1 ?? []).length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Objectifs N-1 — Synthèse
                </h3>
                <div className="space-y-3">
                  {(preCollab?.objectifsNMoins1 ?? []).map((obj, i) => {
                    const synthese = objectifsSynthese[obj.intitule];
                    const collabPct = obj.avancementCollaborateur ?? 0;
                    const managerPct = obj.avancementManager;
                    const hasEcart = managerPct !== undefined && Math.abs(collabPct - managerPct) >= 10;

                    return (
                      <div key={i} className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                        <p className="text-[13px] font-medium text-noir mb-2">{obj.intitule}</p>

                        <div className="space-y-1 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gris-60 w-24 shrink-0">Collaborateur</span>
                            <div className="flex-1 h-1.5 bg-gris-20 rounded-full overflow-hidden">
                              <div className="h-full bg-applipro rounded-full" style={{ width: `${collabPct}%` }} />
                            </div>
                            <span className="text-[11px] font-medium text-applipro w-10 text-right">{collabPct}%</span>
                          </div>
                          {managerPct !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gris-60 w-24 shrink-0">Manager</span>
                              <div className="flex-1 h-1.5 bg-gris-20 rounded-full overflow-hidden">
                                <div className="h-full bg-applipro-dark rounded-full" style={{ width: `${managerPct}%` }} />
                              </div>
                              <span className="text-[11px] font-medium text-applipro-dark w-10 text-right">{managerPct}%</span>
                            </div>
                          )}
                        </div>

                        {hasEcart && (
                          <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-statut-orange/15 text-statut-orange mb-2">
                            Écart ({Math.abs(collabPct - (managerPct ?? 0))}%)
                          </span>
                        )}

                        {/* Synthèse éditable */}
                        <div className="pt-2 border-t border-gris-10">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-semibold text-applipro">% Synthèse</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={synthese?.pourcentage ?? ""}
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, Number(e.target.value)));
                                setObjectifsSynthese((prev) => ({
                                  ...prev,
                                  [obj.intitule]: {
                                    ...prev[obj.intitule],
                                    pourcentage: val,
                                    commentaire: prev[obj.intitule]?.commentaire ?? "",
                                  },
                                }));
                              }}
                              placeholder="—"
                              className="w-16 px-2 py-1 rounded border border-gris-20 bg-white text-[12px] text-center placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
                            />
                            <span className="text-[11px] text-gris-60">%</span>
                          </div>
                          <input
                            type="text"
                            value={synthese?.commentaire ?? ""}
                            onChange={(e) => {
                              setObjectifsSynthese((prev) => ({
                                ...prev,
                                [obj.intitule]: {
                                  ...prev[obj.intitule],
                                  pourcentage: prev[obj.intitule]?.pourcentage ?? 0,
                                  commentaire: e.target.value,
                                },
                              }));
                            }}
                            placeholder="Commentaire de synthèse..."
                            className="w-full px-2 py-1 rounded border border-gris-20 bg-white text-[12px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Compétences — Synthèse */}
            {(preCollab?.competences ?? []).length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Compétences — Synthèse
                </h3>
                <div className="space-y-3">
                  {(preCollab?.competences ?? []).map((comp, i) => {
                    const synthese = competencesSynthese[comp.competence];
                    const hasEcart = comp.niveauManager !== undefined && Math.abs(comp.niveauCollaborateur - comp.niveauManager) >= 1;

                    return (
                      <div key={i} className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[13px] font-medium text-noir">{comp.competence}</span>
                          {hasEcart && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-statut-orange/15 text-statut-orange">
                              Écart ({Math.abs(comp.niveauCollaborateur - (comp.niveauManager ?? 0))})
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mb-2 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="text-gris-60 w-24 shrink-0">Collaborateur</span>
                            <MiniStars value={comp.niveauCollaborateur} />
                          </div>
                          {comp.niveauManager !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-gris-60 w-24 shrink-0">Manager</span>
                              <MiniStars value={comp.niveauManager} />
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-gris-60 w-24 shrink-0">Attendu</span>
                            <MiniStars value={comp.niveauAttendu} />
                          </div>
                        </div>

                        {/* Synthèse éditable */}
                        <div className="pt-2 border-t border-gris-10">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-semibold text-applipro">Synthèse</span>
                            <StarRating
                              value={synthese?.niveau ?? 0}
                              onChange={(v) => {
                                setCompetencesSynthese((prev) => ({
                                  ...prev,
                                  [comp.competence]: {
                                    ...prev[comp.competence],
                                    niveau: v,
                                    commentaire: prev[comp.competence]?.commentaire ?? "",
                                  },
                                }));
                              }}
                            />
                          </div>
                          <input
                            type="text"
                            value={synthese?.commentaire ?? ""}
                            onChange={(e) => {
                              setCompetencesSynthese((prev) => ({
                                ...prev,
                                [comp.competence]: {
                                  ...prev[comp.competence],
                                  niveau: prev[comp.competence]?.niveau ?? 0,
                                  commentaire: e.target.value,
                                },
                              }));
                            }}
                            placeholder="Commentaire de synthèse..."
                            className="w-full px-2 py-1 rounded border border-gris-20 bg-white text-[12px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Formations retenues */}
            {allFormations.length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Formations retenues
                </h3>
                <div className="space-y-2">
                  {allFormations.map((f, i) => {
                    const isSelected = formationsSelectionnees.includes(f.intitule);
                    return (
                      <label
                        key={i}
                        className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-applipro/5 border-applipro/30"
                            : "bg-gris-05 border-gris-10 hover:border-gris-20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFormationSelectionnee(f.intitule)}
                          className="mt-0.5 rounded border-gris-20 text-applipro focus:ring-applipro"
                        />
                        <div className="flex-1">
                          <p className="text-[13px] text-noir">{f.intitule}</p>
                          <span className={`text-[10px] font-medium ${
                            f.origine === "collaborateur" ? "text-applipro" : "text-applipro-dark"
                          }`}>
                            {f.origine === "collaborateur" ? "Demande collaborateur" : "Recommandation manager"}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Points forts — Synthèse */}
            {(preManager?.pointsForts ?? []).length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Points forts — Synthèse
                </h3>
                <div className="space-y-1 mb-2">
                  {(preManager?.pointsForts ?? []).map((point, i) => (
                    <div key={i} className="flex items-start gap-2 p-1.5 rounded border bg-statut-vert/5 border-statut-vert/15">
                      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-statut-vert" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="flex-1 text-[12px] text-noir">{point}</span>
                    </div>
                  ))}
                </div>
                <textarea
                  value={pointsFortsCommentaire}
                  onChange={(e) => setPointsFortsCommentaire(e.target.value)}
                  placeholder="Commentaire de synthèse sur les points forts..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
                />
              </div>
            )}

            {/* 5b. Axes de progrès — Synthèse */}
            {(preManager?.axesProgres ?? []).length > 0 && (
              <div>
                <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
                  Axes de progrès — Synthèse
                </h3>
                <div className="space-y-1 mb-2">
                  {(preManager?.axesProgres ?? []).map((axe, i) => (
                    <div key={i} className="flex items-start gap-2 p-1.5 rounded border bg-statut-orange/5 border-statut-orange/15">
                      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5 text-statut-orange" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      <span className="flex-1 text-[12px] text-noir">{axe}</span>
                    </div>
                  ))}
                </div>
                <textarea
                  value={axesProgresCommentaire}
                  onChange={(e) => setAxesProgresCommentaire(e.target.value)}
                  placeholder="Commentaire de synthèse sur les axes de progrès..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gris-20 bg-gris-05 text-noir text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro focus:border-transparent resize-y"
                />
              </div>
            )}

            {/* 6. Notes de séance */}
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

            {/* 7. Bilan - Synthèse globale */}
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

            {/* 8. Points à améliorer */}
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
                      <div>
                        <label className="block text-[12px] font-medium text-gris-60 mb-1">Échéance</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: "2mois", label: "2 mois" },
                            { value: "6mois", label: "6 mois" },
                            { value: "1an", label: "1 an" },
                            { value: "custom", label: "Personnalisé" },
                          ].map((opt) => {
                            const current = point.echeance || "";
                            const isCustom = opt.value === "custom";
                            const isSelected = isCustom
                              ? current.startsWith("custom:")
                              : current === opt.value;
                            return (
                              <label
                                key={opt.value}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] cursor-pointer transition-colors ${
                                  isSelected
                                    ? "border-applipro bg-applipro/10 text-applipro font-semibold"
                                    : "border-gris-20 bg-white text-gris-60 hover:border-gris-40"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`echeance-${index}`}
                                  checked={isSelected}
                                  onChange={() =>
                                    updatePointAmeliorer(
                                      index,
                                      "echeance",
                                      isCustom ? "custom:" : opt.value
                                    )
                                  }
                                  className="sr-only"
                                />
                                {opt.label}
                              </label>
                            );
                          })}
                        </div>
                        {(point.echeance || "").startsWith("custom:") && (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="number"
                              min={1}
                              value={(point.echeance || "").replace("custom:", "") || ""}
                              onChange={(e) =>
                                updatePointAmeliorer(index, "echeance", `custom:${e.target.value}`)
                              }
                              placeholder="Nb"
                              className="w-20 px-2 py-1.5 rounded border border-gris-20 bg-white text-[13px] placeholder-gris-40 focus:outline-none focus:ring-2 focus:ring-applipro"
                            />
                            <span className="text-[12px] text-gris-60">jours</span>
                          </div>
                        )}
                      </div>
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

            {/* 9. Remarques */}
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

            {/* 10. Bouton enregistrer */}
            <Button type="button" variant="primary" size="regular" onClick={handleSave} className="w-full">
              {enregistre ? "Bilan enregistré ✓" : "Enregistrer le bilan"}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Lien Finalisation ─── */}
      <div className="flex justify-end">
        <Link
          href={`/entretiens/${entretien.id}/finalisation`}
          className="inline-flex items-center gap-2 text-[14px] font-medium text-applipro hover:text-applipro/80 transition-colors"
        >
          Finaliser l&apos;entretien
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
