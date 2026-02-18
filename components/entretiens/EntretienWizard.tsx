"use client";

import { useEffect, useState } from "react";
import type { EntretienWithDetails } from "@/lib/types";
import {
  type WizardEntretienData,
  type WizardStepKey,
  loadWizardFromStorage,
  saveWizardToStorage,
} from "@/lib/wizardData";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

const STEPS: { key: WizardStepKey; label: string; description: string }[] = [
  {
    key: "pre_collaborateur",
    label: "Préparation collaborateur",
    description: "Vue des réponses saisies par le collaborateur avant l'entretien.",
  },
  {
    key: "pre_manager",
    label: "Préparation manager",
    description:
      "Synthèse de préparation du manager : points forts, axes de progrès.",
  },
  {
    key: "session",
    label: "Session d’entretien",
    description:
      "Vue comparative et décisions prises pendant l’entretien (objectifs, formations).",
  },
  {
    key: "validation",
    label: "Validation & signature",
    description:
      "Statut de validation par les deux parties et remarques finales.",
  },
];

interface EntretienWizardProps {
  entretien: EntretienWithDetails;
  wizard: WizardEntretienData;
}

export function EntretienWizard({ entretien, wizard }: EntretienWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wizardState, setWizardState] = useState<WizardEntretienData>(wizard);

  useEffect(() => {
    const loaded = loadWizardFromStorage(entretien.id, wizard);
    setWizardState(loaded);
  }, [entretien.id, wizard]);

  const updateWizard = (updater: (prev: WizardEntretienData) => WizardEntretienData) => {
    setWizardState((prev) => {
      const next = updater(prev);
      saveWizardToStorage(next);
      return next;
    });
  };

  const currentStep = STEPS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STEPS.length - 1;

  const goNext = () => {
    if (!isLast) setCurrentIndex((i) => i + 1);
  };

  const goPrev = () => {
    if (!isFirst) setCurrentIndex((i) => i - 1);
  };

  return (
    <div className="space-y-6">
      <StepHeader currentIndex={currentIndex} />

      <div className="bg-white rounded-lg border border-gris-10 p-6 space-y-4">
        <header>
          <h2 className="text-[16px] font-semibold text-applipro-dark">
            {currentStep.label}
          </h2>
          <p className="text-[14px] text-gris-60 mt-1">
            {currentStep.description}
          </p>
          <p className="text-[13px] text-gris-60 mt-1">
            Collaborateur :{" "}
            <span className="font-medium text-noir">
              {entretien.collaborateur.prenom} {entretien.collaborateur.nom}
            </span>{" "}
            — Manager :{" "}
            <span className="font-medium text-noir">
              {entretien.manager.prenom} {entretien.manager.nom}
            </span>
          </p>
        </header>

        <section>
          {currentStep.key === "pre_collaborateur" && (
            <PreCollaborateurView
              wizard={wizardState}
              onChange={updateWizard}
            />
          )}
          {currentStep.key === "pre_manager" && (
            <PreManagerView wizard={wizardState} />
          )}
          {currentStep.key === "session" && (
            <SessionView
              wizard={wizardState}
              onChangeWizard={updateWizard}
            />
          )}
          {currentStep.key === "validation" && (
            <ValidationView
              wizard={wizardState}
              onChangeWizard={updateWizard}
            />
          )}
        </section>
      </div>

      <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] text-gris-60">
          <span>
            Étape {currentIndex + 1} sur {STEPS.length}
          </span>
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            size="regular"
            disabled={isFirst}
            onClick={goPrev}
          >
            Précédent
          </Button>
          <Button
            type="button"
            variant="primary"
            size="regular"
            onClick={goNext}
            disabled={isLast}
          >
            {isLast ? "Terminé" : "Suivant"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function StepHeader({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="bg-blanc rounded-2xl shadow-sm border border-applipro-05 px-4 py-5 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <ol className="flex flex-1 items-center justify-between gap-3">
          {STEPS.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <li
                key={step.key}
                className="flex-1 flex flex-col items-center text-center gap-1"
              >
                <div className="flex items-center w-full max-w-[140px]">
                  {index > 0 && (
                    <div
                      className={`h-px flex-1 ${
                        isCompleted
                          ? "bg-applipro"
                          : "bg-gris-20"
                      }`}
                    />
                  )}
                  <div
                    className={`flex items-center justify-center rounded-full border-2 w-8 h-8 shrink-0 ${
                      isActive
                        ? "border-applipro bg-applipro text-white"
                        : isCompleted
                          ? "border-applipro bg-applipro-05 text-applipro-dark"
                          : "border-gris-20 bg-white text-gris-60"
                    }`}
                  >
                    <span className="text-[13px] font-semibold">
                      {index + 1}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-px flex-1 ${
                        index < currentIndex
                          ? "bg-applipro"
                          : "bg-gris-20"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`mt-1 text-[13px] px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-applipro-05 text-applipro-dark"
                      : "text-gris-60"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function PreCollaborateurView({
  wizard,
  onChange,
}: {
  wizard: WizardEntretienData;
  onChange: (updater: (prev: WizardEntretienData) => WizardEntretienData) => void;
}) {
  const { preCollaborateur } = wizard;

  const isEmptyPre =
    preCollaborateur.evaluations.length === 0 &&
    preCollaborateur.objectifsNMoins1.length === 0 &&
    preCollaborateur.besoinsFormation.length === 0 &&
    preCollaborateur.competences.length === 0;

  const handleSimulate = () => {
    if (!isEmptyPre) return;
    onChange((prev) => ({
      ...prev,
      preCollaborateur: {
        ressentiGeneral:
          "Globalement satisfait(e) de mon poste, quelques points d'amélioration identifiés sur la charge de travail et la formation.",
        evaluations: [
          {
            theme: "Bien-être au travail",
            score: 4,
            commentaireCollaborateur:
              "Bonne ambiance, relations fluides avec l'équipe et le manager.",
          },
          {
            theme: "Charge de travail",
            score: 3,
            commentaireCollaborateur:
              "Périodes de surcharge ponctuelles mais support de l'équipe.",
          },
        ],
        objectifsNMoins1: [
          {
            intitule: "Approfondir la maîtrise des outils internes",
            echeance: "2025-12-31",
            avancementCollaborateur: 75,
            commentaireCollaborateur:
              "Je me sens plus autonome qu'en début d'année.",
          },
        ],
        besoinsFormation: [
          {
            intitule: "Formation avancée sur l'outil métier",
            origine: "collaborateur",
          },
        ],
        competences: [
          {
            competence: "Organisation et priorisation",
            niveauAttendu: 4,
            niveauCollaborateur: 3,
          },
        ],
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-applipro bg-gris-05 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-[14px] font-semibold text-noir mb-2">
            Ressenti général du collaborateur
          </h3>
          <p className="text-[14px] text-gris-80">
            {preCollaborateur.ressentiGeneral}
          </p>
        </div>
        <Button
          type="button"
          size="small"
          variant="secondary"
          className="mt-2 sm:mt-0 shrink-0"
          onClick={handleSimulate}
          disabled={!isEmptyPre}
        >
          Simuler pré‑entretien collaborateur
        </Button>
      </div>

      {preCollaborateur.evaluations.length > 0 && (
        <section>
          <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Évaluation qualitative
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {preCollaborateur.evaluations.map((item) => (
              <div
                key={item.theme}
                className="border border-gris-10 rounded-applipro p-3 bg-blanc"
              >
                <p className="text-[13px] font-medium text-noir">
                  {item.theme}
                </p>
                <p className="mt-1 text-[24px] font-semibold text-applipro">
                  {item.score}/5
                </p>
                {item.commentaireCollaborateur && (
                  <p className="mt-1 text-[13px] text-gris-60">
                    {item.commentaireCollaborateur}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {preCollaborateur.objectifsNMoins1.length > 0 && (
        <section>
          <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Objectifs N-1 et avancement
          </h3>
          <div className="space-y-3">
            {preCollaborateur.objectifsNMoins1.map((obj, index) => (
              <div
                key={`${obj.intitule}-${index}`}
                className="border border-gris-10 rounded-applipro p-3"
              >
                <p className="text-[14px] font-medium text-noir">
                  {obj.intitule}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[13px] text-gris-60">
                  {obj.echeance && (
                    <span>Échéance : {formatDate(obj.echeance)}</span>
                  )}
                  {typeof obj.avancementCollaborateur === "number" && (
                    <span>Avancement déclaré : {obj.avancementCollaborateur}%</span>
                  )}
                </div>
                {obj.commentaireCollaborateur && (
                  <p className="mt-1 text-[13px] text-gris-60">
                    {obj.commentaireCollaborateur}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {preCollaborateur.besoinsFormation.length > 0 && (
        <section>
          <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Besoins en formation exprimés
          </h3>
          <ul className="space-y-2 text-[14px] text-noir">
            {preCollaborateur.besoinsFormation.map((b, index) => (
              <li
                key={`${b.intitule}-${index}`}
                className="flex items-start gap-2"
              >
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-applipro shrink-0" />
                <div>
                  <span>{b.intitule}</span>
                  {b.commentaire && (
                    <p className="text-[13px] text-gris-60">{b.commentaire}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {preCollaborateur.competences.length > 0 && (
        <section>
          <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Auto-évaluation des compétences
          </h3>
          <div className="space-y-2">
            {preCollaborateur.competences.map((c, index) => (
              <div
                key={`${c.competence}-${index}`}
                className="border border-gris-10 rounded-applipro p-3 flex flex-col gap-1"
              >
                <p className="text-[14px] font-medium text-noir">
                  {c.competence}
                </p>
                <p className="text-[13px] text-gris-60">
                  Niveau attendu : {c.niveauAttendu}/5 — Déclaré :
                  {" "}
                  {c.niveauCollaborateur}/5
                </p>
                {c.commentaire && (
                  <p className="text-[13px] text-gris-60">{c.commentaire}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PreManagerView({ wizard }: { wizard: WizardEntretienData }) {
  const { preManager } = wizard;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-applipro bg-gris-05">
        <h3 className="text-[14px] font-semibold text-noir mb-2">
          Synthèse de préparation du manager
        </h3>
        <p className="text-[14px] text-gris-80">
          {preManager.syntheseManager}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border border-gris-10 rounded-applipro p-3">
          <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Points forts identifiés
          </h3>
          <ul className="space-y-1 text-[14px] text-noir">
            {preManager.pointsForts.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-statut-vert shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-gris-10 rounded-applipro p-3">
          <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Axes de progrès
          </h3>
          <ul className="space-y-1 text-[14px] text-noir">
            {preManager.axesProgres.map((a) => (
              <li key={a} className="flex items-start gap-2">
                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-statut-orange shrink-0" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SessionView({
  wizard,
  onChangeWizard,
}: {
  wizard: WizardEntretienData;
  onChangeWizard: (updater: (prev: WizardEntretienData) => WizardEntretienData) => void;
}) {
  const { preCollaborateur, session } = wizard;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
          Vue comparative collaborateur / manager
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border border-gris-10 rounded-applipro p-3 bg-gris-05">
            <h4 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
              Préparation collaborateur
            </h4>
            <p className="text-[14px] text-gris-80">
              {preCollaborateur.ressentiGeneral}
            </p>
          </div>
          <div className="border border-gris-10 rounded-applipro p-3 bg-blanc">
            <h4 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
              Notes manager en séance
            </h4>
            <Textarea
              label=""
              aria-label="Notes manager pendant la séance"
              value={session.notesSeance}
              onChange={(e) =>
                onChangeWizard((prev) => ({
                  ...prev,
                  session: {
                    ...prev.session,
                    notesSeance: e.target.value,
                  },
                }))
              }
              rows={5}
              className="mt-0"
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
          Nouveaux objectifs (N+1)
        </h3>
        {session.objectifsNPlus1.length === 0 ? (
          <p className="text-[14px] text-gris-60">
            Aucun objectif défini pour le moment (simulation).
          </p>
        ) : (
          <div className="space-y-3">
            {session.objectifsNPlus1.map((obj, index) => (
              <div
                key={`${obj.intitule}-${index}`}
                className="border border-gris-10 rounded-applipro p-3"
              >
                <p className="text-[14px] font-medium text-noir">
                  {obj.intitule}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[13px] text-gris-60">
                  {obj.echeance && (
                    <span>Échéance cible : {formatDate(obj.echeance)}</span>
                  )}
                </div>
                {obj.commentaireManager && (
                  <p className="mt-1 text-[13px] text-gris-60">
                    {obj.commentaireManager}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
          Décisions formation prises en séance
        </h3>
        {session.decisionsFormation.length === 0 ? (
          <p className="text-[14px] text-gris-60">
            Aucun besoin formation saisi pour le moment (simulation).
          </p>
        ) : (
          <ul className="space-y-2 text-[14px] text-noir">
            {session.decisionsFormation.map((b, index) => (
              <li
                key={`${b.intitule}-${index}`}
                className="flex items-start gap-2"
              >
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-statut-vert shrink-0" />
                <div>
                  <span>{b.intitule}</span>
                  <p className="text-[13px] text-gris-60">
                    Origine : {b.origine === "manager" ? "Manager" : "Collaborateur"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ValidationView({
  wizard,
  onChangeWizard,
}: {
  wizard: WizardEntretienData;
  onChangeWizard: (updater: (prev: WizardEntretienData) => WizardEntretienData) => void;
}) {
  const { validation, session, preCollaborateur, preManager } = wizard;
  const remarquesChamps = session.remarquesChamps || {};
  const remarquesEntries = Object.entries(remarquesChamps).filter(
    ([, value]) => value && value.trim().length > 0
  );

  // Helper function to translate champId to a human-readable label
  const getChampLabel = (champId: string): { source: string; label: string } => {
    const [type, indexStr] = champId.split(":");
    const index = parseInt(indexStr, 10);

    switch (type) {
      case "collab_ressenti":
        return { source: "Collaborateur", label: "Ressenti général" };
      case "collab_evaluation":
        return {
          source: "Collaborateur",
          label: `Évaluation : ${preCollaborateur.evaluations[index]?.theme || `#${index + 1}`}`,
        };
      case "collab_objectif":
        return {
          source: "Collaborateur",
          label: `Objectif N-1 : ${preCollaborateur.objectifsNMoins1[index]?.intitule || `#${index + 1}`}`,
        };
      case "collab_formation":
        return {
          source: "Collaborateur",
          label: `Besoin formation : ${preCollaborateur.besoinsFormation[index]?.intitule || `#${index + 1}`}`,
        };
      case "collab_competence":
        return {
          source: "Collaborateur",
          label: `Compétence : ${preCollaborateur.competences[index]?.competence || `#${index + 1}`}`,
        };
      case "manager_synthese":
        return { source: "Manager", label: "Synthèse manager" };
      case "manager_evaluation":
        return {
          source: "Manager",
          label: `Évaluation : ${preManager.evaluationsManager?.[index]?.theme || `#${index + 1}`}`,
        };
      case "manager_point_fort":
        return {
          source: "Manager",
          label: `Point fort : ${preManager.pointsForts[index] || `#${index + 1}`}`,
        };
      case "manager_axe":
        return {
          source: "Manager",
          label: `Axe de progrès : ${preManager.axesProgres[index] || `#${index + 1}`}`,
        };
      case "manager_formation":
        return { source: "Manager", label: "Besoins formation (manager)" };
      case "manager_notes":
        return { source: "Manager", label: "Notes préparatoires" };
      default:
        return { source: "Autre", label: champId };
    }
  };

  const statutBadgeClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-applipro text-[13px] font-medium";

  const renderStatut = (
    statut: "en_attente" | "valide",
    role: "Collaborateur" | "Manager",
  ) => {
    const isValide = statut === "valide";
    return (
      <div className="flex items-center justify-between border border-gris-10 rounded-applipro px-3 py-2">
        <div>
          <p className="text-[13px] text-gris-60">{role}</p>
          <p className="text-[14px] text-noir font-medium">
            {isValide ? "Validé" : "En attente de validation"}
          </p>
        </div>
        <span
          className={`${statutBadgeClasses} ${
            isValide
              ? "bg-statut-vert-20 text-statut-vert"
              : "bg-gris-10 text-gris-80"
          }`}
        >
          {isValide ? "Signé" : "À signer"}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <section className="grid sm:grid-cols-2 gap-4">
        {renderStatut(
          validation.statutSignatureCollaborateur,
          "Collaborateur",
        )}
        {renderStatut(validation.statutValidationManager, "Manager")}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="small"
          variant="secondary"
          onClick={() =>
            onChangeWizard((prev) => ({
              ...prev,
              validation: {
                ...prev.validation,
                statutSignatureCollaborateur: "valide",
                remarquesCollaborateur:
                  prev.validation.remarquesCollaborateur &&
                  !prev.validation.remarquesCollaborateur.startsWith(
                    "Aucune remarque",
                  )
                    ? prev.validation.remarquesCollaborateur
                    : "Je confirme que le compte-rendu reflète bien nos échanges.",
              },
            }))
          }
        >
          Simuler validation collaborateur
        </Button>
        <Button
          type="button"
          size="small"
          variant="secondary"
          onClick={() =>
            onChangeWizard((prev) => ({
              ...prev,
              validation: {
                ...prev.validation,
                statutValidationManager: "valide",
              },
            }))
          }
        >
          Simuler validation manager
        </Button>
      </div>

      {/* Remarques sur les champs (issues de la Vue Entretien) */}
      {remarquesEntries.length > 0 && (
        <section>
          <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-3">
            Remarques sur les champs ({remarquesEntries.length})
          </h3>
          <p className="text-[13px] text-gris-60 mb-3">
            Ces remarques ont été ajoutées depuis la Vue Entretien pour justifier des points particuliers ou signaler des problèmes.
          </p>
          <div className="space-y-3">
            {remarquesEntries.map(([champId, remarque]) => {
              const { source, label } = getChampLabel(champId);
              const isCollaborateur = source === "Collaborateur";
              return (
                <div
                  key={champId}
                  className={`border rounded-applipro p-3 ${
                    isCollaborateur
                      ? "border-applipro-20 bg-applipro-05"
                      : "border-statut-orange-20 bg-statut-orange-05"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        isCollaborateur
                          ? "bg-applipro-20 text-applipro-dark"
                          : "bg-statut-orange-20 text-statut-orange"
                      }`}
                    >
                      {source}
                    </span>
                    <span className="text-[13px] font-medium text-noir">
                      {label}
                    </span>
                  </div>
                  <p className="text-[14px] text-gris-80 whitespace-pre-wrap">
                    {remarque}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
          Remarques finales du collaborateur
        </h3>
        <Textarea
          label=""
          aria-label="Remarques finales du collaborateur"
          value={validation.remarquesCollaborateur}
          onChange={(e) =>
            onChangeWizard((prev) => ({
              ...prev,
              validation: {
                ...prev.validation,
                remarquesCollaborateur: e.target.value,
              },
            }))
          }
          rows={4}
          placeholder="Remarques simulées côté collaborateur..."
          className="mt-0"
        />
        <p className="mt-1 text-[13px] text-gris-60">
          Dans la version finale, cette zone serait uniquement en lecture côté manager.
        </p>
      </section>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

