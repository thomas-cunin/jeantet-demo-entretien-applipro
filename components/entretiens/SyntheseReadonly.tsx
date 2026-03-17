"use client";

import type {
  WizardEntretienData,
  WizardNotationSynthese,
  WizardObjectifSynthese,
  WizardCompetenceSynthese,
} from "@/lib/wizardData";

interface SyntheseReadonlyProps {
  wizard: WizardEntretienData;
}

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

function formatEcheance(val?: string): string {
  if (!val) return "—";
  switch (val) {
    case "2mois":
      return "2 mois";
    case "6mois":
      return "6 mois";
    case "1an":
      return "1 an";
    default:
      if (val.startsWith("custom:")) {
        const raw = val.replace("custom:", "").trim();
        const n = parseInt(raw, 10);
        if (!n || isNaN(n)) return "Personnalisé";
        if (n >= 365 && n % 365 === 0) {
          const ans = n / 365;
          return ans === 1 ? "1 an" : `${ans} ans`;
        }
        if (n >= 30 && n % 30 === 0) {
          const mois = n / 30;
          return `${mois} mois`;
        }
        return `${n} jour${n > 1 ? "s" : ""}`;
      }
      return val;
  }
}

export function SyntheseReadonly({ wizard }: SyntheseReadonlyProps) {
  const session = wizard.session;
  const bilan = session.bilan;
  const notationsSynthese = session.notationsSynthese ?? {};
  const objectifsSynthese = session.objectifsSynthese ?? {};
  const competencesSynthese = session.competencesSynthese ?? {};
  const formationsSelectionnees = session.formationsSelectionnees ?? [];

  const hasNotations = Object.keys(notationsSynthese).length > 0;
  const hasObjectifs = Object.keys(objectifsSynthese).length > 0;
  const hasCompetences = Object.keys(competencesSynthese).length > 0;
  const hasFormations = formationsSelectionnees.length > 0;
  const hasPointsForts = !!session.pointsFortsCommentaire;
  const hasAxesProgres = !!session.axesProgresCommentaire;
  const hasNotesSeance = !!session.notesSeance;
  const hasSyntheseGlobale = !!bilan.syntheseGlobale;
  const hasPointsAmeliorer = bilan.pointsAmeliorer.length > 0;
  const hasRemarquesCollab = !!bilan.remarquesCollaborateur;
  const hasRemarquesManager = !!bilan.remarquesManager;

  const isEmpty =
    !hasNotations &&
    !hasObjectifs &&
    !hasCompetences &&
    !hasFormations &&
    !hasPointsForts &&
    !hasAxesProgres &&
    !hasNotesSeance &&
    !hasSyntheseGlobale &&
    !hasPointsAmeliorer &&
    !hasRemarquesCollab &&
    !hasRemarquesManager;

  if (isEmpty) {
    return (
      <div className="bg-white rounded-lg border border-gris-10 p-6">
        <p className="text-[14px] text-gris-40 italic">Aucune synthèse disponible pour cet entretien.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gris-10 p-6 space-y-5">
      <h2 className="text-base font-semibold text-applipro-dark flex items-center gap-2">
        <svg className="w-5 h-5 text-applipro" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Synthèse de l&apos;entretien
      </h2>

      {/* Notations synthèse */}
      {hasNotations && (
        <div>
          <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Notations — Synthèse
          </h3>
          <div className="space-y-2">
            {Object.entries(notationsSynthese).map(([theme, data]: [string, WizardNotationSynthese]) => (
              <div key={theme} className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[13px] font-medium text-noir">{theme}</span>
                  <MiniStars value={data.score} />
                </div>
                {data.commentaire && (
                  <p className="text-[12px] text-gris-60">{data.commentaire}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Objectifs synthèse */}
      {hasObjectifs && (
        <div>
          <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Objectifs — Synthèse
          </h3>
          <div className="space-y-2">
            {Object.entries(objectifsSynthese).map(([intitule, data]: [string, WizardObjectifSynthese]) => (
              <div key={intitule} className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[13px] font-medium text-noir">{intitule}</span>
                  <span className="text-[13px] font-semibold text-applipro">{data.pourcentage}%</span>
                </div>
                <div className="w-full bg-gris-10 rounded-full h-1.5 mb-1">
                  <div
                    className="bg-applipro h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(data.pourcentage, 100)}%` }}
                  />
                </div>
                {data.commentaire && (
                  <p className="text-[12px] text-gris-60">{data.commentaire}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compétences synthèse */}
      {hasCompetences && (
        <div>
          <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Compétences — Synthèse
          </h3>
          <div className="space-y-2">
            {Object.entries(competencesSynthese).map(([comp, data]: [string, WizardCompetenceSynthese]) => (
              <div key={comp} className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[13px] font-medium text-noir">{comp}</span>
                  <span className="text-[13px] font-semibold text-applipro">Niveau {data.niveau}/5</span>
                </div>
                {data.commentaire && (
                  <p className="text-[12px] text-gris-60">{data.commentaire}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formations retenues */}
      {hasFormations && (
        <div>
          <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Formations retenues
          </h3>
          <div className="space-y-1">
            {formationsSelectionnees.map((f, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded bg-statut-vert/5 border border-statut-vert/15">
                <svg className="w-3.5 h-3.5 shrink-0 text-statut-vert" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[13px] text-noir">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points forts commentaire */}
      {hasPointsForts && (
        <div>
          <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Points forts — Commentaire
          </h3>
          <p className="text-[13px] text-noir whitespace-pre-wrap bg-gris-05 border border-gris-10 rounded-lg p-3">
            {session.pointsFortsCommentaire}
          </p>
        </div>
      )}

      {/* Axes de progrès commentaire */}
      {hasAxesProgres && (
        <div>
          <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Axes de progrès — Commentaire
          </h3>
          <p className="text-[13px] text-noir whitespace-pre-wrap bg-gris-05 border border-gris-10 rounded-lg p-3">
            {session.axesProgresCommentaire}
          </p>
        </div>
      )}

      {/* Notes de séance */}
      {hasNotesSeance && (
        <div>
          <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Notes de séance
          </h3>
          <p className="text-[13px] text-noir whitespace-pre-wrap bg-gris-05 border border-gris-10 rounded-lg p-3">
            {session.notesSeance}
          </p>
        </div>
      )}

      {/* Synthèse globale */}
      {hasSyntheseGlobale && (
        <div>
          <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Synthèse globale
          </h3>
          <p className="text-[13px] text-noir whitespace-pre-wrap bg-gris-05 border border-gris-10 rounded-lg p-3">
            {bilan.syntheseGlobale}
          </p>
        </div>
      )}

      {/* Points à améliorer */}
      {hasPointsAmeliorer && (
        <div>
          <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Points à améliorer
          </h3>
          <div className="space-y-2">
            {bilan.pointsAmeliorer.map((point, i) => (
              <div key={i} className="p-3 rounded-lg bg-gris-05 border border-gris-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-noir">{point.intitule}</span>
                  <span className="text-[12px] text-gris-60 bg-gris-10 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {formatEcheance(point.echeance)}
                  </span>
                </div>
                {point.remarque && (
                  <p className="text-[12px] text-gris-60 mt-1">{point.remarque}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remarques collaborateur */}
      {hasRemarquesCollab && (
        <div>
          <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Remarques du collaborateur
          </h3>
          <p className="text-[13px] text-noir whitespace-pre-wrap bg-gris-05 border border-gris-10 rounded-lg p-3">
            {bilan.remarquesCollaborateur}
          </p>
        </div>
      )}

      {/* Remarques manager */}
      {hasRemarquesManager && (
        <div>
          <h3 className="text-[12px] font-semibold text-gris-80 uppercase tracking-wide mb-2">
            Remarques du manager
          </h3>
          <p className="text-[13px] text-noir whitespace-pre-wrap bg-gris-05 border border-gris-10 rounded-lg p-3">
            {bilan.remarquesManager}
          </p>
        </div>
      )}
    </div>
  );
}
