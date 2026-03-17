"use client";

import { useState, useEffect } from "react";
import type { WizardEntretienData } from "@/lib/wizardData";
import { loadWizardFromStorage, saveWizardToStorage } from "@/lib/wizardData";
import { SyntheseReadonly } from "@/components/entretiens/SyntheseReadonly";

interface PostEntretienCollaborateurProps {
  entretienId: string;
  initialWizard: WizardEntretienData;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <div className="flex gap-1">
      {([1, 2, 3, 4, 5] as const).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="cursor-pointer hover:scale-110 transition-transform"
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

export function PostEntretienCollaborateur({
  entretienId,
  initialWizard,
}: PostEntretienCollaborateurProps) {
  const [wizard, setWizard] = useState<WizardEntretienData>(initialWizard);

  useEffect(() => {
    const loaded = loadWizardFromStorage(entretienId, initialWizard);
    setWizard(loaded);
  }, [entretienId, initialWizard]);

  const updateWizard = (updater: (prev: WizardEntretienData) => WizardEntretienData) => {
    setWizard((prev) => {
      const next = updater(prev);
      saveWizardToStorage(next);
      return next;
    });
  };

  const validation = wizard.validation;

  return (
    <div className="space-y-6">
      <SyntheseReadonly wizard={wizard} />

      {/* Section Feedback */}
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
            <span className="text-[14px] font-semibold text-applipro">
              {validation.feedbackNote}/5
            </span>
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
    </div>
  );
}
