"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
            <PreCollaborateurView wizard={wizardState} />
          )}
          {currentStep.key === "pre_manager" && (
            <PreManagerView wizard={wizardState} />
          )}
          {currentStep.key === "session" && (
            <SessionView
              wizard={wizardState}
              entretienId={entretien.id}
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

// Helper constants for display
const SMILEY_BY_SCORE: Record<number, { emoji: string; label: string }> = {
  1: { emoji: "😞", label: "Très insatisfait" },
  2: { emoji: "😕", label: "Insatisfait" },
  3: { emoji: "😐", label: "Neutre" },
  4: { emoji: "🙂", label: "Satisfait" },
  5: { emoji: "😊", label: "Très satisfait" },
};

// Composant pour afficher les étoiles en lecture seule
function StarsDisplay({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= score ? "text-statut-orange" : "text-gris-20"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {score > 0 && SMILEY_BY_SCORE[score] && (
        <span className="ml-2 text-xl">{SMILEY_BY_SCORE[score].emoji}</span>
      )}
    </div>
  );
}

// Composant pour afficher un smiley sélectionné
function SmileyDisplay({ score }: { score: number }) {
  const smiley = SMILEY_BY_SCORE[score];
  if (!smiley) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl">{smiley.emoji}</span>
      <span className="text-[14px] font-medium text-applipro-dark">{smiley.label}</span>
    </div>
  );
}

// Composant pour afficher tous les smileys avec un sélectionné
function SmileyScaleDisplay({ score }: { score: number }) {
  return (
    <div className="flex justify-between gap-1">
      {[1, 2, 3, 4, 5].map((v) => {
        const smiley = SMILEY_BY_SCORE[v];
        const isSelected = score === v;
        return (
          <div
            key={v}
            className={`flex-1 min-w-0 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
              isSelected
                ? "border-applipro bg-applipro-05 shadow-sm"
                : "border-gris-10 bg-white opacity-50"
            }`}
          >
            <span className="text-2xl leading-none">{smiley.emoji}</span>
            <span className={`text-[11px] text-center leading-tight ${isSelected ? "text-applipro-dark font-medium" : "text-gris-60"}`}>
              {v}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// En-tête de section numérotée
function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <h3 className="text-base font-semibold text-noir flex items-center gap-2 mb-3">
      <span className="w-8 h-8 rounded-full bg-applipro-05 text-applipro flex items-center justify-center text-sm font-bold">
        {number}
      </span>
      {title}
    </h3>
  );
}

function PreCollaborateurView({
  wizard,
}: {
  wizard: WizardEntretienData;
}) {
  const { preCollaborateur } = wizard;

  return (
    <div className="space-y-6">
      {/* Section 1 - Ressenti général */}
      <section className="bg-gris-05 rounded-xl p-4 border border-gris-10">
        <SectionHeader number={1} title="Ressenti général" />
        <p className="text-[14px] text-gris-80 leading-relaxed">
          {preCollaborateur.ressentiGeneral || <span className="italic text-gris-40">Non renseigné</span>}
        </p>
      </section>

      {/* Section 2 - Niveau de satisfaction (smiley) */}
      <section className="bg-gris-05 rounded-xl p-4 border border-gris-10">
        <SectionHeader number={2} title="Niveau de satisfaction" />
        <p className="text-[13px] text-gris-60 mb-3">
          Niveau de satisfaction global du collaborateur
        </p>
        <SmileyScaleDisplay score={preCollaborateur.sentimentGlobal} />
      </section>

      {/* Section 3 - Évaluation par thème (étoiles) */}
      {preCollaborateur.evaluations.length > 0 && (
        <section className="bg-gris-05 rounded-xl p-4 border border-gris-10">
          <SectionHeader number={3} title="Évaluation par thème" />
          <p className="text-[13px] text-gris-60 mb-4">
            Notes de 1 à 5 étoiles pour chaque critère
          </p>
          <div className="space-y-4">
            {preCollaborateur.evaluations.map((item, index) => (
              <div
                key={`${item.theme}-${index}`}
                className="p-3 rounded-xl bg-white border border-gris-10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                  <span className="text-[14px] font-medium text-noir">{item.theme}</span>
                  <StarsDisplay score={item.score} />
                </div>
                {item.commentaireCollaborateur && (
                  <p className="text-[13px] text-gris-60 mt-2 italic">
                    &quot;{item.commentaireCollaborateur}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 4 - Ressenti par thème (smileys) */}
      {preCollaborateur.ressentiParTheme && preCollaborateur.ressentiParTheme.length > 0 && (
        <section className="bg-gris-05 rounded-xl p-4 border border-gris-10">
          <SectionHeader number={4} title="Ressenti par thème" />
          <p className="text-[13px] text-gris-60 mb-4">
            Ressenti du collaborateur pour chaque thème
          </p>
          <div className="space-y-3">
            {preCollaborateur.ressentiParTheme.map((item, index) => (
              <div
                key={`${item.theme}-${index}`}
                className="p-3 rounded-xl bg-white border border-gris-10 flex items-center justify-between gap-3"
              >
                <span className="text-[14px] font-medium text-noir">{item.theme}</span>
                <SmileyDisplay score={item.score} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 5 - Objectifs de l'année passée */}
      {preCollaborateur.objectifsNMoins1.length > 0 && (
        <section className="bg-gris-05 rounded-xl p-4 border border-gris-10">
          <SectionHeader number={5} title="Objectifs de l'année passée" />
          <p className="text-[13px] text-gris-60 mb-4">
            Avancement déclaré par le collaborateur sur les objectifs fixés
          </p>
          <div className="space-y-4">
            {preCollaborateur.objectifsNMoins1.map((obj, index) => (
              <div
                key={`${obj.intitule}-${index}`}
                className="p-4 rounded-xl bg-white border border-gris-10 space-y-3"
              >
                <div>
                  <p className="text-[15px] font-medium text-noir">{obj.intitule}</p>
                  {obj.echeance && (
                    <p className="text-[13px] text-gris-60 mt-0.5">
                      Échéance : {obj.echeance}
                    </p>
                  )}
                </div>
                {typeof obj.avancementCollaborateur === "number" && (
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] text-gris-80 shrink-0">Avancement</span>
                    <div className="flex-1 h-3 bg-gris-20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-applipro rounded-full transition-all"
                        style={{ width: `${obj.avancementCollaborateur}%` }}
                      />
                    </div>
                    <span className="text-[14px] font-semibold text-applipro w-12 text-right">
                      {obj.avancementCollaborateur}%
                    </span>
                  </div>
                )}
                {obj.commentaireCollaborateur && (
                  <p className="text-[13px] text-gris-60 italic">
                    &quot;{obj.commentaireCollaborateur}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 6 - Besoins en formation */}
      {preCollaborateur.besoinsFormation.length > 0 && (
        <section className="bg-gris-05 rounded-xl p-4 border border-gris-10">
          <SectionHeader number={6} title="Besoins en formation" />
          <p className="text-[13px] text-gris-60 mb-3">
            Souhaits de formation exprimés par le collaborateur
          </p>
          <ul className="space-y-2">
            {preCollaborateur.besoinsFormation.map((b, index) => (
              <li
                key={`${b.intitule}-${index}`}
                className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gris-10"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-applipro shrink-0" />
                <div>
                  <span className="text-[14px] font-medium text-noir">{b.intitule}</span>
                  {b.commentaire && (
                    <p className="text-[13px] text-gris-60 mt-1">{b.commentaire}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Section 7 - Auto-évaluation des compétences */}
      {preCollaborateur.competences.length > 0 && (
        <section className="bg-gris-05 rounded-xl p-4 border border-gris-10">
          <SectionHeader number={7} title="Auto-évaluation des compétences" />
          <p className="text-[13px] text-gris-60 mb-4">
            Niveau actuel évalué par le collaborateur vs niveau attendu
          </p>
          <div className="space-y-3">
            {preCollaborateur.competences.map((c, index) => (
              <div
                key={`${c.competence}-${index}`}
                className="p-3 rounded-xl bg-white border border-gris-10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-[14px] font-medium text-noir">{c.competence}</span>
                  <StarsDisplay score={c.niveauCollaborateur} />
                </div>
                <div className="mt-2 flex items-center gap-4 text-[13px]">
                  <span className="text-gris-60">
                    Niveau attendu : <strong className="text-noir">{c.niveauAttendu}/5</strong>
                  </span>
                  <span className="text-gris-60">
                    Auto-évaluation : <strong className="text-applipro">{c.niveauCollaborateur}/5</strong>
                  </span>
                </div>
                {c.commentaire && (
                  <p className="text-[13px] text-gris-60 mt-2 italic">
                    &quot;{c.commentaire}&quot;
                  </p>
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

      {/* Évaluations manager */}
      {preManager.evaluationsManager && preManager.evaluationsManager.length > 0 && (
        <section>
          <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Évaluations du manager
          </h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {preManager.evaluationsManager.map((ev) => (
              <div
                key={ev.theme}
                className="border border-gris-10 rounded-applipro p-3 bg-blanc"
              >
                <p className="text-[13px] font-medium text-noir">
                  {ev.theme}
                </p>
                <div className="mt-1 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= ev.score ? "text-statut-orange" : "text-gris-20"}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                {ev.commentaire && (
                  <p className="mt-1 text-[13px] text-gris-60">
                    {ev.commentaire}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border border-gris-10 rounded-applipro p-3">
          <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Points forts identifiés
          </h3>
          {preManager.pointsForts.length > 0 ? (
            <ul className="space-y-1 text-[14px] text-noir">
              {preManager.pointsForts.map((p, i) => (
                <li key={`${p}-${i}`} className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-statut-vert shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-gris-40 italic">Non renseigné</p>
          )}
        </div>
        <div className="border border-gris-10 rounded-applipro p-3">
          <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Axes de progrès
          </h3>
          {preManager.axesProgres.length > 0 ? (
            <ul className="space-y-1 text-[14px] text-noir">
              {preManager.axesProgres.map((a, i) => (
                <li key={`${a}-${i}`} className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-statut-orange shrink-0" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-gris-40 italic">Non renseigné</p>
          )}
        </div>
      </div>

      {/* Besoins formation identifiés */}
      {preManager.besoinsFormationManager && (
        <section>
          <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Besoins en formation identifiés
          </h3>
          <div className="p-3 border border-gris-10 rounded-applipro bg-gris-05">
            <p className="text-[14px] text-gris-80">
              {preManager.besoinsFormationManager}
            </p>
          </div>
        </section>
      )}

      {/* Notes préparatoires */}
      {preManager.notesPreparatoires && (
        <section>
          <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Notes préparatoires
          </h3>
          <div className="p-3 border border-gris-10 rounded-applipro bg-gris-05">
            <p className="text-[14px] text-gris-80 italic">
              {preManager.notesPreparatoires}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function SessionView({
  wizard,
  entretienId,
  onChangeWizard,
}: {
  wizard: WizardEntretienData;
  entretienId: string;
  onChangeWizard: (updater: (prev: WizardEntretienData) => WizardEntretienData) => void;
}) {
  const { preCollaborateur, preManager, session } = wizard;
  const { bilan } = session;

  return (
    <div className="space-y-6">
      {/* Bouton accès Vue Entretien */}
      <div className="p-4 rounded-applipro bg-applipro-05 border border-applipro-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-applipro-dark">
            Vue Entretien complète
          </h3>
          <p className="text-[13px] text-gris-60 mt-1">
            Accédez à la vue détaillée pour consulter les deux préparations côte à côte,
            prendre des notes et ajouter des remarques sur chaque champ.
          </p>
        </div>
        <Link href={`/entretiens/${entretienId}/vue`}>
          <Button type="button" variant="primary" size="small">
            Ouvrir la Vue Entretien
          </Button>
        </Link>
      </div>

      {/* Vue comparative */}
      <section>
        <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
          Vue comparative collaborateur / manager
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border border-gris-10 rounded-applipro p-3 bg-gris-05">
            <h4 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
              Ressenti collaborateur
            </h4>
            <p className="text-[14px] text-gris-80">
              {preCollaborateur.ressentiGeneral || <span className="italic text-gris-40">Non renseigné</span>}
            </p>
          </div>
          <div className="border border-gris-10 rounded-applipro p-3 bg-gris-05">
            <h4 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
              Synthèse manager
            </h4>
            <p className="text-[14px] text-gris-80">
              {preManager.syntheseManager || <span className="italic text-gris-40">Non renseigné</span>}
            </p>
          </div>
        </div>
      </section>

      {/* Notes de séance */}
      <section>
        <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
          Notes de séance
        </h3>
        <div className="border border-gris-10 rounded-applipro p-3 bg-blanc">
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
            rows={4}
            placeholder="Notez les points clés abordés pendant l'entretien..."
            className="mt-0"
          />
        </div>
      </section>

      {/* Nouveaux objectifs N+1 */}
      <section>
        <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
          Nouveaux objectifs (N+1)
        </h3>
        {session.objectifsNPlus1.length === 0 ? (
          <p className="text-[14px] text-gris-40 italic p-3 bg-gris-05 rounded-applipro border border-gris-10">
            Aucun objectif défini. Utilisez la Vue Entretien pour définir les objectifs.
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

      {/* Décisions formation */}
      <section>
        <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
          Décisions formation prises en séance
        </h3>
        {session.decisionsFormation.length === 0 ? (
          <p className="text-[14px] text-gris-40 italic p-3 bg-gris-05 rounded-applipro border border-gris-10">
            Aucune décision formation. Utilisez la Vue Entretien pour les définir.
          </p>
        ) : (
          <ul className="space-y-2 text-[14px] text-noir">
            {session.decisionsFormation.map((b, index) => (
              <li
                key={`${b.intitule}-${index}`}
                className="flex items-start gap-2 border border-gris-10 rounded-applipro p-3"
              >
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-statut-vert shrink-0" />
                <div>
                  <span className="font-medium">{b.intitule}</span>
                  <p className="text-[13px] text-gris-60">
                    Origine : {b.origine === "manager" ? "Manager" : "Collaborateur"}
                  </p>
                  {b.commentaire && (
                    <p className="text-[13px] text-gris-60 mt-1">{b.commentaire}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Bilan de l'entretien */}
      <section>
        <h3 className="text-[13px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
          Bilan de l&apos;entretien
        </h3>
        <div className="space-y-4">
          {/* Synthèse globale */}
          {bilan.syntheseGlobale ? (
            <div className="p-3 border border-gris-10 rounded-applipro bg-gris-05">
              <h4 className="text-[13px] font-medium text-noir mb-1">Synthèse globale</h4>
              <p className="text-[14px] text-gris-80">{bilan.syntheseGlobale}</p>
            </div>
          ) : (
            <p className="text-[14px] text-gris-40 italic p-3 bg-gris-05 rounded-applipro border border-gris-10">
              Synthèse globale non renseignée. Utilisez la Vue Entretien pour la compléter.
            </p>
          )}

          {/* Points à améliorer */}
          {bilan.pointsAmeliorer && bilan.pointsAmeliorer.length > 0 && (
            <div className="p-3 border border-gris-10 rounded-applipro">
              <h4 className="text-[13px] font-medium text-noir mb-2">Points à améliorer</h4>
              <div className="space-y-2">
                {bilan.pointsAmeliorer.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-statut-orange/5 rounded-md border border-statut-orange/20">
                    <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-statut-orange shrink-0" />
                    <div className="flex-1">
                      <span className="text-[14px] font-medium text-noir">{point.intitule}</span>
                      {point.echeance && (
                        <span className="text-[13px] text-gris-60 ml-2">
                          (Échéance : {formatDate(point.echeance)})
                        </span>
                      )}
                      {point.remarque && (
                        <p className="text-[13px] text-gris-60 mt-1">{point.remarque}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarques collaborateur / manager */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-3 border border-gris-10 rounded-applipro">
              <h4 className="text-[13px] font-medium text-noir mb-1">Remarques collaborateur</h4>
              <p className="text-[14px] text-gris-80">
                {bilan.remarquesCollaborateur || <span className="italic text-gris-40">Non renseigné</span>}
              </p>
            </div>
            <div className="p-3 border border-gris-10 rounded-applipro">
              <h4 className="text-[13px] font-medium text-noir mb-1">Remarques manager</h4>
              <p className="text-[14px] text-gris-80">
                {bilan.remarquesManager || <span className="italic text-gris-40">Non renseigné</span>}
              </p>
            </div>
          </div>
        </div>
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

